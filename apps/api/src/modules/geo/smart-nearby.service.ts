import { Injectable } from '@nestjs/common';
import {
  SmartNearbyContext,
  NearbyPoiItem,
  TASHKENT_METRO_STATIONS,
  TASHKENT_LANDMARKS
} from '@uytop/shared-types';
import { RoutingService } from './routing.service';

interface StaticPoi {
  id: string;
  nameUz: string;
  nameRu: string;
  category: 'metro' | 'school' | 'kindergarten' | 'hospital' | 'supermarket' | 'pharmacy' | 'park';
  lat: number;
  lng: number;
}

const TASHKENT_STATIC_POIS: StaticPoi[] = [
  // Metro Stations
  ...TASHKENT_METRO_STATIONS.map((m) => ({
    id: `metro-${m.id}`,
    nameUz: `${m.nameUz} metrosi`,
    nameRu: `Метро ${m.nameRu}`,
    category: 'metro' as const,
    lat: m.lat,
    lng: m.lng,
  })),

  // Schools (Top Tashkent Schools)
  { id: 'sch-1', nameUz: '178-sonli ixtisoslashgan maktab', nameRu: 'Специализированная школа №178', category: 'school', lat: 41.2825, lng: 69.2152 },
  { id: 'sch-2', nameUz: '144-sonli umumiy o\'rta maktab', nameRu: 'Общеобразовательная школа №144', category: 'school', lat: 41.2751, lng: 69.2312 },
  { id: 'sch-3', nameUz: 'Cambridge International School', nameRu: 'Кембриджская Международная Школа', category: 'school', lat: 41.3195, lng: 69.2785 },
  { id: 'sch-4', nameUz: 'Al-Xorazmiy nomidagi IT-maktab', nameRu: 'IT-школа им. Аль-Хорезми', category: 'school', lat: 41.2782, lng: 69.1945 },
  { id: 'sch-5', nameUz: '60-sonli nemis tili maktabi', nameRu: 'Школа №60 с углубленным изучением немецкого', category: 'school', lat: 41.2991, lng: 69.2815 },

  // Kindergartens
  { id: 'knd-1', nameUz: 'Smart Kids bolalar bog\'chasi', nameRu: 'Детский сад Smart Kids', category: 'kindergarten', lat: 41.2845, lng: 69.2185 },
  { id: 'knd-2', nameUz: 'Erkatoy nodavlat bog\'chasi', nameRu: 'Частный детский сад Erkatoy', category: 'kindergarten', lat: 41.3125, lng: 69.2465 },
  { id: 'knd-3', nameUz: '324-sonli davlat maktabgacha ta\'lim tashkiloti', nameRu: 'Государственный детский сад №324', category: 'kindergarten', lat: 41.3582, lng: 69.2845 },

  // Healthcare / Clinics
  { id: 'hsp-1', nameUz: 'Akfa Medline ko\'p tarmoqli tibbiyot markazi', nameRu: 'Многопрофильный медцентр Akfa Medline', category: 'hospital', lat: 41.3452, lng: 69.2145 },
  { id: 'hsp-2', nameUz: 'Shox Med Center klinikasi', nameRu: 'Клиника Shox Med Center', category: 'hospital', lat: 41.2985, lng: 69.2715 },
  { id: 'hsp-3', nameUz: '16-sonli shahar klinik shifoxonasi', nameRu: 'Городская клиническая больница №16', category: 'hospital', lat: 41.2762, lng: 69.1865 },
  { id: 'hsp-4', nameUz: 'Toshkent Pediatriya Instituti klinikasi', nameRu: 'Клиника ТашПМИ (САМПИ)', category: 'hospital', lat: 41.3612, lng: 69.3245 },

  // Supermarkets & Shopping
  { id: 'mkt-1', nameUz: 'Korzinka — Qatortol', nameRu: 'Корзинка — Катартал', category: 'supermarket', lat: 41.2795, lng: 69.2085 },
  { id: 'mkt-2', nameUz: 'Makro — Novza', nameRu: 'Макро — Новза', category: 'supermarket', lat: 41.2925, lng: 69.2245 },
  { id: 'mkt-3', nameUz: 'Havas diskaunteri', nameRu: 'Дискаунтер Havas', category: 'supermarket', lat: 41.2852, lng: 69.2415 },
  { id: 'mkt-4', nameUz: 'Chorsu dehqon bozori', nameRu: 'Рынок Чорсу', category: 'supermarket', lat: 41.3275, lng: 69.2355 },

  // Parks
  { id: 'prk-1', nameUz: 'Magic City madaniyat va istirohat bog\'i', nameRu: 'Парк Magic City', category: 'park', lat: 41.3039, lng: 69.2488 },
  { id: 'prk-2', nameUz: 'Alisher Navoiy nomidagi Milliy Bog\'', nameRu: 'Национальный парк Алишера Навои', category: 'park', lat: 41.3031, lng: 69.2319 },
  { id: 'prk-3', nameUz: 'Toshkent Botanika bog\'i', nameRu: 'Ташкентский Ботанический сад', category: 'park', lat: 41.3445, lng: 69.3142 },
  { id: 'prk-4', nameUz: 'Ecopark', nameRu: 'Экопарк', category: 'park', lat: 41.3121, lng: 69.2985 },
];

@Injectable()
export class SmartNearbyService {
  constructor(private routingService: RoutingService) {}

  /**
   * Calculate nearby POIs and objective convenience scores for a property coordinate
   */
  async getNearbyContext(lat: number, lng: number): Promise<SmartNearbyContext> {
    const nearbyItems: NearbyPoiItem[] = [];

    for (const poi of TASHKENT_STATIC_POIS) {
      const straightLineM = this.routingService.calculateStraightLineMeters(lat, lng, poi.lat, poi.lng);

      // Only consider POIs within 2.5 km
      if (straightLineM <= 2500) {
        const route = await this.routingService.getWalkingRoute(
          { lat, lng },
          { lat: poi.lat, lng: poi.lng }
        );

        nearbyItems.push({
          id: poi.id,
          nameUz: poi.nameUz,
          nameRu: poi.nameRu,
          category: poi.category,
          lat: poi.lat,
          lng: poi.lng,
          straightLineMeters: straightLineM,
          routeDistanceMeters: route.routeDistanceMeters,
          walkingMinutes: route.durationMinutes,
        });
      }
    }

    // Sort POIs by walking time
    nearbyItems.sort((a, b) => a.walkingMinutes - b.walkingMinutes);

    // Calculate Category Scores
    const transportPois = nearbyItems.filter((p) => p.category === 'metro');
    const educationPois = nearbyItems.filter((p) => p.category === 'school' || p.category === 'kindergarten');
    const shoppingPois = nearbyItems.filter((p) => p.category === 'supermarket');
    const healthcarePois = nearbyItems.filter((p) => p.category === 'hospital');
    const recreationPois = nearbyItems.filter((p) => p.category === 'park');

    const scoreByMinWalk = (pois: NearbyPoiItem[], baseScore = 95) => {
      if (pois.length === 0) return 45;
      const closestWalk = pois[0].walkingMinutes;
      if (closestWalk <= 5) return 100;
      if (closestWalk <= 10) return 90;
      if (closestWalk <= 15) return 78;
      if (closestWalk <= 20) return 65;
      return 50;
    };

    const transportScore = scoreByMinWalk(transportPois);
    const educationScore = scoreByMinWalk(educationPois);
    const shoppingScore = scoreByMinWalk(shoppingPois);
    const healthcareScore = scoreByMinWalk(healthcarePois);
    const recreationScore = scoreByMinWalk(recreationPois);

    const overallConvenienceScore = Math.round(
      transportScore * 0.3 +
      educationScore * 0.25 +
      shoppingScore * 0.2 +
      healthcareScore * 0.15 +
      recreationScore * 0.1
    );

    return {
      overallConvenienceScore,
      categoryScores: {
        transport: transportScore,
        education: educationScore,
        shopping: shoppingScore,
        healthcare: healthcareScore,
        recreation: recreationScore,
      },
      poiItems: nearbyItems.slice(0, 12),
    };
  }
}
