import { Injectable, Logger } from '@nestjs/common';
import {
  Property,
  PropertySearchFilters,
  UserPreferenceModel,
  PropertyRecommendation,
  TASHKENT_LANDMARKS
} from '@uytop/shared-types';
import { SearchService } from '../search/search.service';
import { GeoService } from '../geo/geo.service';
import { PropertiesService } from '../properties/properties.service';
import { AiRankingEngine } from './ai-home-finder.ranking';

@Injectable()
export class AiControlledTools {
  private readonly logger = new Logger(AiControlledTools.name);

  constructor(
    private searchService: SearchService,
    private geoService: GeoService,
    private propertiesService: PropertiesService
  ) {}

  /**
   * Tool 1: Execute a structured property search with safety filters
   */
  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      const res = await this.searchService.searchProperties({
        ...filters,
        limit: filters.limit || 30
      });
      return res.items;
    } catch (err) {
      this.logger.error(`searchProperties error: ${err}`);
      return [];
    }
  }

  /**
   * Tool 2: Find properties within a given radius from coordinates
   */
  async findNearbyProperties(lat: number, lng: number, radiusMeters = 3000): Promise<Property[]> {
    return this.searchProperties({
      centerLat: lat,
      centerLng: lng,
      radiusMeters,
      limit: 30
    });
  }

  /**
   * Tool 3: Find properties near a specific metro station
   */
  async findNearMetro(metroStationName: string, maxDistMeters = 1000): Promise<Property[]> {
    return this.searchProperties({
      query: metroStationName,
      nearMetro: true,
      limit: 30
    });
  }

  /**
   * Tool 4: Find properties near a designated landmark (e.g. Tashkent City, INHA, etc.)
   */
  async findNearLandmark(landmarkIdOrName: string, radiusMeters = 3000): Promise<Property[]> {
    const clean = landmarkIdOrName.toLowerCase();
    const landmark = TASHKENT_LANDMARKS.find(
      (l) => l.id.toLowerCase() === clean || l.nameUz.toLowerCase().includes(clean)
    );

    if (landmark) {
      return this.findNearbyProperties(landmark.lat, landmark.lng, radiusMeters);
    }

    return this.searchProperties({ query: landmarkIdOrName, limit: 20 });
  }

  /**
   * Tool 5: Score and rank properties with verifiable facts
   */
  rankProperties(properties: Property[], preferences: UserPreferenceModel): PropertyRecommendation[] {
    return AiRankingEngine.rankProperties(properties, preferences);
  }

  /**
   * Tool 6: Get verified property details by ID
   */
  async getPropertyDetails(id: string): Promise<Property | null> {
    try {
      return (await this.propertiesService.findById(id)) as unknown as Property;
    } catch {
      return null;
    }
  }

  /**
   * Tool 7: Compare multiple properties side by side
   */
  async compareProperties(ids: string[]): Promise<Property[]> {
    const list: Property[] = [];
    for (const id of ids.slice(0, 4)) {
      const p = await this.getPropertyDetails(id);
      if (p) list.push(p);
    }
    return list;
  }
}
