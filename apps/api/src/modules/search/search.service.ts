import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertySearchFilters, ListingStatus, Property } from '@uytop/shared-types';
import { GeoService } from '../geo/geo.service';
import { RoutingService } from '../geo/routing.service';
import { SmartNearbyService } from '../geo/smart-nearby.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    private geoService: GeoService,
    private routingService: RoutingService,
    private smartNearbyService: SmartNearbyService,
  ) {}

  async searchProperties(filters: PropertySearchFilters): Promise<{ items: Property[]; total: number; page: number; limit: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const query = this.propertyRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img')
      .where('p.status = :status', { status: ListingStatus.PUBLISHED });

    // Transaction Type
    if (filters.transactionType) {
      query.andWhere('p.transactionType = :transactionType', { transactionType: filters.transactionType });
    }

    // Property Type
    if (filters.propertyType) {
      if (Array.isArray(filters.propertyType)) {
        query.andWhere('p.propertyType IN (:...propertyTypes)', { propertyTypes: filters.propertyType });
      } else {
        query.andWhere('p.propertyType = :propertyType', { propertyType: filters.propertyType });
      }
    }

    // District
    if (filters.district) {
      query.andWhere('LOWER(p.district) LIKE LOWER(:district)', { district: `%${filters.district}%` });
    }

    // Rooms
    if (filters.rooms && filters.rooms.length > 0) {
      query.andWhere('p.rooms IN (:...rooms)', { rooms: filters.rooms });
    }

    // Price Bounds
    if (filters.minPrice) {
      query.andWhere('p.priceUzs >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice) {
      query.andWhere('p.priceUzs <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    // Furnished
    if (filters.furnished !== undefined) {
      query.andWhere('p.furnished = :furnished', { furnished: filters.furnished });
    }

    // Min/Max Area
    if (filters.minArea) {
      query.andWhere('p.areaSqm >= :minArea', { minArea: filters.minArea });
    }
    if (filters.maxArea) {
      query.andWhere('p.areaSqm <= :maxArea', { maxArea: filters.maxArea });
    }

    // Renovation
    if (filters.renovation && filters.renovation.length > 0) {
      query.andWhere('p.renovation IN (:...renovations)', { renovations: filters.renovation });
    }

    // Verification
    if (filters.verificationTier && filters.verificationTier.length > 0) {
      query.andWhere('p.verificationTier IN (:...tiers)', { tiers: filters.verificationTier });
    }

    let properties = await query.getMany();

    // ==========================================
    // 1. WALKING TIME & ACCESSIBILITY SEARCH MODE
    // ==========================================
    const isWalkingSearch =
      filters.searchMode === 'WALKING_TIME' ||
      (filters.travelMinutes && filters.travelMinutes > 0);

    const originLat = Number(filters.originLat ?? filters.centerLat);
    const originLng = Number(filters.originLng ?? filters.centerLng);

    if (isWalkingSearch && !isNaN(originLat) && !isNaN(originLng)) {
      const maxMinutes = Number(filters.travelMinutes) || 15;
      // Coarse Pre-Filter (straight line bounds: maxMinutes * 80m/min * 1.35 factor)
      const coarseBoundingMeters = Math.round(maxMinutes * 80 * 1.35);

      const coarseCandidates = properties.filter((prop) => {
        const straightM = this.routingService.calculateStraightLineMeters(
          originLat,
          originLng,
          Number(prop.latitude),
          Number(prop.longitude)
        );
        (prop as any).straightLineDistanceMeters = straightM;
        return straightM <= coarseBoundingMeters;
      });

      // Sort by straight-line distance to take top candidate set
      coarseCandidates.sort(
        (a, b) => (a as any).straightLineDistanceMeters - (b as any).straightLineDistanceMeters
      );

      // Batch route calculation for top candidates (max 30 candidates to prevent overhead)
      const routeMap = await this.routingService.batchCalculateWalkingRoutes(
        { lat: originLat, lng: originLng, name: filters.originName },
        coarseCandidates,
        30
      );

      // Filter by actual walking duration
      const reachableProperties: PropertyEntity[] = [];
      for (const candidate of coarseCandidates) {
        const route = routeMap.get(candidate.id);
        if (route && route.durationMinutes <= maxMinutes) {
          (candidate as any).travelMetadata = route;
          (candidate as any).walkingMinutes = route.durationMinutes;
          reachableProperties.push(candidate);
        }
      }

      properties = reachableProperties;

      // Default sort by walking time unless specified otherwise
      if (!filters.sortBy || filters.sortBy === 'walking_time' || filters.sortBy === 'distance') {
        properties.sort((a, b) => (a as any).walkingMinutes - (b as any).walkingMinutes);
      }
    }
    // ==========================================
    // 2. STANDARD RADIUS SEARCH MODE
    // ==========================================
    else if (!isNaN(originLat) && !isNaN(originLng)) {
      const radius = Number(filters.radiusMeters) || 5000;

      properties = properties.filter((prop) => {
        const dist = this.geoService.calculateDistanceMeters(
          originLat,
          originLng,
          Number(prop.latitude),
          Number(prop.longitude)
        );
        (prop as any).distanceFromCenterMeters = dist;
        return dist <= radius;
      });

      if (filters.sortBy === 'distance') {
        properties.sort((a, b) => (a as any).distanceFromCenterMeters - (b as any).distanceFromCenterMeters);
      }
    }

    // Price & Newest Sorting
    if (filters.sortBy === 'price_asc') {
      properties.sort((a, b) => Number(a.priceUzs) - Number(b.priceUzs));
    } else if (filters.sortBy === 'price_desc') {
      properties.sort((a, b) => Number(b.priceUzs) - Number(a.priceUzs));
    } else if (filters.sortBy === 'newest') {
      properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = properties.length;
    const paginatedItems = properties.slice(skip, skip + limit);

    // Compute dynamic match reasons & attach Smart Nearby for UX
    const enriched = paginatedItems.map((p) => {
      const reasons: string[] = [];
      if (p.nearestMetroDistanceMeters && p.nearestMetroDistanceMeters <= 500) {
        const mins = Math.max(1, Math.round(p.nearestMetroDistanceMeters / 80));
        reasons.push(`${p.nearestMetroStation} metrosiga ${mins} daqiqalik yo'l`);
      }
      if (p.furnished) {
        reasons.push('To\'liq mebellar bilan jihozlangan');
      }
      if (filters.maxPrice && Number(p.priceUzs) <= Number(filters.maxPrice)) {
        reasons.push('Belgilangan budjetingiz ichida');
      }
      if (p.verificationTier === 'INSPECTED' || p.verificationTier === 'DOCS_VERIFIED') {
        reasons.push('Hujjatlari tekshirilgan va ishonchli');
      }

      return {
        ...p,
        matchReasons: reasons,
        travelMetadata: (p as any).travelMetadata,
        priceUzs: Number(p.priceUzs),
        priceUsd: Number(p.priceUsd),
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        areaSqm: Number(p.areaSqm)
      } as unknown as Property;
    });

    return {
      items: enriched,
      total,
      page,
      limit
    };
  }
}
