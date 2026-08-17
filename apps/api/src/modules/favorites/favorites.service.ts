import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FavoriteEntity } from '../../database/entities/favorite.entity';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertyComparisonResult, UZBEK_AMENITIES, Property } from '@uytop/shared-types';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    private geoService: GeoService,
  ) {}

  async toggleFavorite(userId: string, propertyId: string): Promise<{ isFavorited: boolean }> {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, propertyId }
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { isFavorited: false };
    }

    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) {
      throw new NotFoundException("Ko'chmas mulk e'loni topilmadi");
    }

    const fav = this.favoriteRepository.create({ userId, propertyId });
    await this.favoriteRepository.save(fav);
    return { isFavorited: true };
  }

  async getUserFavorites(userId: string): Promise<PropertyEntity[]> {
    const favs = await this.favoriteRepository.find({
      where: { userId },
      relations: ['property', 'property.images'],
      order: { createdAt: 'DESC' }
    });

    return favs.map((f) => f.property).filter(Boolean);
  }

  async compareProperties(propertyIds: string[]): Promise<PropertyComparisonResult> {
    const properties = await this.propertyRepository.find({
      where: { id: In(propertyIds) },
      relations: ['images']
    });

    if (properties.length === 0) {
      return {
        properties: [],
        criteria: {
          priceComparison: [],
          areaComparison: [],
          locationScore: [],
          amenitiesDiff: []
        }
      };
    }

    // Amir Temur square in Tashkent center
    const CENTER_LAT = 41.311087;
    const CENTER_LNG = 69.279737;

    let minPricePerSqm = Infinity;
    let maxArea = -Infinity;

    const priceComparison = properties.map((p) => {
      const pricePerSqm = Math.round(Number(p.priceUzs) / Number(p.areaSqm));
      if (pricePerSqm < minPricePerSqm) minPricePerSqm = pricePerSqm;
      return { id: p.id, pricePerSqm, isLowest: false };
    });
    priceComparison.forEach((item) => {
      if (item.pricePerSqm === minPricePerSqm) item.isLowest = true;
    });

    const areaComparison = properties.map((p) => {
      const area = Number(p.areaSqm);
      if (area > maxArea) maxArea = area;
      return { id: p.id, areaSqm: area, isLargest: false };
    });
    areaComparison.forEach((item) => {
      if (item.areaSqm === maxArea) item.isLargest = true;
    });

    const locationScore = properties.map((p) => {
      const dist = this.geoService.calculateDistanceMeters(CENTER_LAT, CENTER_LNG, Number(p.latitude), Number(p.longitude));
      const score = Math.max(10, Math.min(100, Math.round(100 - dist / 150)));
      return { id: p.id, score, distanceToCenterMeters: dist };
    });

    const amenitiesDiff = UZBEK_AMENITIES.map((amenity) => {
      const availableIn = properties
        .filter((p) => p.amenities && p.amenities[amenity.key] === true)
        .map((p) => p.id);
      return {
        amenityKey: amenity.key,
        nameUz: amenity.nameUz,
        availableIn
      };
    });

    return {
      properties: properties as unknown as Property[],
      criteria: {
        priceComparison,
        areaComparison,
        locationScore,
        amenitiesDiff
      }
    };
  }
}
