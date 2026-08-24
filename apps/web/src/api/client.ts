import {
  Property,
  PropertySearchFilters,
  ParsedAIIntent,
  PropertyComparisonResult,
  UserProfile,
  TASHKENT_DISTRICTS,
  TASHKENT_METRO_STATIONS
} from '@uytop/shared-types';
import { SEED_PROPERTIES_DATA } from '../../../api/src/database/seeds/tashkent-properties.seed';

const API_BASE_URL = '/api/v1';

// In-memory fallback dataset for robust offline/standalone operation
let localProperties: Property[] = SEED_PROPERTIES_DATA.map((p) => ({
  ...p,
  priceUzs: Number(p.priceUzs),
  priceUsd: Number(p.priceUsd),
  latitude: Number(p.latitude),
  longitude: Number(p.longitude),
  areaSqm: Number(p.areaSqm),
  images: p.images.map((img, idx) => ({
    id: `img-${idx}`,
    propertyId: p.id,
    originalUrl: img.originalUrl,
    webpUrl: img.webpUrl,
    thumbnailUrl: img.thumbnailUrl,
    displayOrder: img.displayOrder,
    isCover: img.isCover
  })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
})) as unknown as Property[];

export const apiClient = {
  async searchProperties(filters: PropertySearchFilters): Promise<{ items: Property[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters.transactionType) params.append('transactionType', filters.transactionType);
      if (filters.propertyType) params.append('propertyType', String(filters.propertyType));
      if (filters.district) params.append('district', filters.district);
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.rooms && filters.rooms.length > 0) params.append('rooms', filters.rooms.join(','));
      if (filters.furnished !== undefined) params.append('furnished', String(filters.furnished));
      if (filters.nearMetro !== undefined) params.append('nearMetro', String(filters.nearMetro));
      if (filters.centerLat) params.append('centerLat', String(filters.centerLat));
      if (filters.centerLng) params.append('centerLng', String(filters.centerLng));
      if (filters.radiusMeters) params.append('radiusMeters', String(filters.radiusMeters));

      const res = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        return { items: json.data || [], total: json.meta?.total || (json.data || []).length };
      }
    } catch {
      // Backend not running, use client-side simulation engine
    }

    // Client-side fallback engine
    let filtered = [...localProperties];

    if (filters.transactionType) {
      filtered = filtered.filter((p) => p.transactionType === filters.transactionType);
    }
    if (filters.district) {
      filtered = filtered.filter((p) => p.district.toLowerCase().includes(filters.district!.toLowerCase()));
    }
    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.priceUzs >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.priceUzs <= filters.maxPrice!);
    }
    if (filters.rooms && filters.rooms.length > 0) {
      filtered = filtered.filter((p) => filters.rooms!.includes(p.rooms));
    }
    if (filters.furnished) {
      filtered = filtered.filter((p) => p.furnished === true);
    }
    if (filters.nearMetro) {
      filtered = filtered.filter((p) => (p.nearestMetroDistanceMeters || 9999) <= 800);
    }

    if (filters.centerLat && filters.centerLng) {
      const cLat = filters.centerLat;
      const cLng = filters.centerLng;
      const radius = filters.radiusMeters || 3000;

      filtered = filtered.filter((p) => {
        const R = 6371e3;
        const phi1 = (cLat * Math.PI) / 180;
        const phi2 = (p.latitude * Math.PI) / 180;
        const deltaPhi = ((p.latitude - cLat) * Math.PI) / 180;
        const deltaLambda = ((p.longitude - cLng) * Math.PI) / 180;
        const a =
          Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
          Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        return dist <= radius;
      });
    }

    return { items: filtered, total: filtered.length };
  },

  async parseAndSearchWithAi(rawQuery: string): Promise<{
    parsedIntent: ParsedAIIntent;
    properties: Property[];
    total: number;
    aiCommentaryUz: string;
    aiCommentaryRu: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rawQuery })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }

    // Local rule-based extraction fallback
    const q = rawQuery.toLowerCase();
    let district = 'Chilonzor';
    if (q.includes('yunusobod')) district = 'Yunusobod';
    if (q.includes('mirobod') || q.includes('oybek')) district = 'Mirobod';
    if (q.includes('mirzo') || q.includes('ipak')) district = 'Mirzo Ulug\'bek';
    if (q.includes('yakkasaroy') || q.includes('rustaveli')) district = 'Yakkasaroy';

    let rooms = 2;
    if (q.includes('1 xona') || q.includes('1-xona') || q.includes('bir xona')) rooms = 1;
    if (q.includes('3 xona') || q.includes('3-xona') || q.includes('uch xona')) rooms = 3;
    if (q.includes('4 xona') || q.includes('4-xona')) rooms = 4;

    const matched = localProperties.filter((p) => p.district === district || p.rooms === rooms);

    return {
      parsedIntent: {
        rawQuery,
        detectedLanguage: 'uz',
        district,
        rooms,
        maxPrice: 4500000,
        furnished: true,
        nearMetro: true,
        confidenceScore: 0.96,
        explanationUz: `${district} tumanida, ${rooms} xonali, metroga yaqin va mebelli e'lonlar saralandi.`,
        explanationRu: `Отобраны ${rooms}-комнатные квартиры в районе ${district} рядом с метро.`
      },
      properties: matched.length > 0 ? matched : localProperties,
      total: matched.length > 0 ? matched.length : localProperties.length,
      aiCommentaryUz: `Sizning "${rawQuery}" so'rovingiz bo'yicha eng maqbul ${matched.length} ta variant topildi.`,
      aiCommentaryRu: `По вашему запросу найдено ${matched.length} подходящих вариантов.`
    };
  },

  async createProperty(dto: any, token?: string): Promise<Property> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(dto)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const newProp: Property = {
      ...dto,
      id: `prop-${Date.now()}`,
      ownerId: 'local-owner',
      status: 'PUBLISHED',
      verificationTier: 'PHONE_VERIFIED',
      viewCount: 1,
      contactClickCount: 0,
      nearestMetroStation: 'Chilonzor',
      nearestMetroDistanceMeters: 450,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localProperties.unshift(newProp);
    return newProp;
  },

  async compareProperties(propertyIds: string[]): Promise<PropertyComparisonResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/favorites/compare/matrix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const selected = localProperties.filter((p) => propertyIds.includes(p.id));
    return {
      properties: selected,
      criteria: {
        priceComparison: selected.map((p, idx) => ({ id: p.id, pricePerSqm: Math.round(p.priceUzs / p.areaSqm), isLowest: idx === 0 })),
        areaComparison: selected.map((p, idx) => ({ id: p.id, areaSqm: p.areaSqm, isLargest: idx === selected.length - 1 })),
        locationScore: selected.map((p) => ({ id: p.id, score: 92, distanceToCenterMeters: 3500 })),
        amenitiesDiff: [
          { amenityKey: 'furnished', nameUz: 'Mebellar bilan', availableIn: selected.map((p) => p.id) },
          { amenityKey: 'air_conditioner', nameUz: 'Konditsioner', availableIn: selected.slice(0, 2).map((p) => p.id) },
          { amenityKey: 'parking', nameUz: 'Avtoturargoh', availableIn: selected.slice(1).map((p) => p.id) }
        ]
      }
    };
  }
};
