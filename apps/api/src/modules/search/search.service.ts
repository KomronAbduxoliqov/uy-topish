import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertySearchFilters, ListingStatus, Property } from '@uytop/shared-types';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    private geoService: GeoService,
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

    // Price Range
    if (filters.minPrice) {
      query.andWhere('p.priceUzs >= :minPrice', { minPrice: Number(filters.minPrice) });
    }
    if (filters.maxPrice) {
      query.andWhere('p.priceUzs <= :maxPrice', { maxPrice: Number(filters.maxPrice) });
    }

    // Rooms (Array of rooms or single)
    if (filters.rooms && filters.rooms.length > 0) {
      const roomNumbers = Array.isArray(filters.rooms) ? filters.rooms.map(Number) : [Number(filters.rooms)];
      query.andWhere('p.rooms IN (:...rooms)', { rooms: roomNumbers });
    }

    // Furnished
    if (filters.furnished !== undefined && filters.furnished !== null) {
      const isFurnished = String(filters.furnished) === 'true' || filters.furnished === true;
      if (isFurnished) {
        query.andWhere('p.furnished = :furnished', { furnished: true });
      }
    }

    // Near Metro
    if (filters.nearMetro) {
      query.andWhere('p.nearestMetroDistanceMeters <= :maxMetroDist', { maxMetroDist: 800 });
    }

    // Text Query (Full-text / Fuzzy matching across titles, addresses, and districts)
    if (filters.query && filters.query.trim().length > 0) {
      const q = `%${filters.query.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(p.titleUz) LIKE :q OR LOWER(p.titleRu) LIKE :q OR LOWER(p.addressLine) LIKE :q OR LOWER(p.district) LIKE :q OR LOWER(p.descriptionUz) LIKE :q)',
        { q }
      );
    }

    // PostGIS Spatial Bounding / Radius filter if centerLat, centerLng, and radius are given
    let properties = await query.getMany();

    if (filters.centerLat && filters.centerLng) {
      const cLat = Number(filters.centerLat);
      const cLng = Number(filters.centerLng);
      const radius = Number(filters.radiusMeters) || 5000;

      // Filter by Great-Circle distance (PostGIS ST_DWithin logic)
      properties = properties.filter((prop) => {
        const dist = this.geoService.calculateDistanceMeters(cLat, cLng, Number(prop.latitude), Number(prop.longitude));
        (prop as any).distanceFromCenterMeters = dist;
        return dist <= radius;
      });

      if (filters.sortBy === 'distance') {
        properties.sort((a, b) => (a as any).distanceFromCenterMeters - (b as any).distanceFromCenterMeters);
      }
    }

    // Sorting
    if (filters.sortBy === 'price_asc') {
      properties.sort((a, b) => Number(a.priceUzs) - Number(b.priceUzs));
    } else if (filters.sortBy === 'price_desc') {
      properties.sort((a, b) => Number(b.priceUzs) - Number(a.priceUzs));
    } else if (filters.sortBy === 'newest') {
      properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = properties.length;
    const paginatedItems = properties.slice(skip, skip + limit);

    // Compute dynamic match reasons for UX
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
