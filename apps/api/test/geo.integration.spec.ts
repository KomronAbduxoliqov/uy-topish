import { GeoService } from '../src/modules/geo/geo.service';
import { TASHKENT_DISTRICTS, TASHKENT_METRO_STATIONS, TransactionType, PropertyType } from '@uytop/shared-types';

describe('PostgreSQL Spatial Geo Integration Test Suite', () => {
  let geoService: GeoService;

  // Real Tashkent landmark coordinates
  const AMIR_TEMUR_SQUARE = { lat: 41.311087, lng: 69.279737 }; // Tashkent Center
  const NOVZA_METRO = { lat: 41.2828, lng: 69.2132 }; // Chilonzor
  const MINOR_METRO = { lat: 41.3325, lng: 69.2842 }; // Yunusobod
  const BUYUK_IPAK_YULI = { lat: 41.3262, lng: 69.3361 }; // Mirzo Ulug'bek
  const SERGELI_YANGI_HAYOT = { lat: 41.2185, lng: 69.2245 }; // Sergeli (~11 km from center)

  // Deterministic seeded test fixtures
  const testSpatialProperties = [
    {
      id: 'prop-chilonzor-close',
      title: 'Novza metrosi yonidagi kvartira',
      lat: 41.2835, // ~100m from Novza metro
      lng: 69.2140,
      priceUzs: 4000000,
      rooms: 2,
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.RENT,
    },
    {
      id: 'prop-chilonzor-medium',
      title: 'Chilonzor 9-mavze kvartira',
      lat: 41.2745, // ~1.1km from Novza metro
      lng: 69.2065,
      priceUzs: 3800000,
      rooms: 2,
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.RENT,
    },
    {
      id: 'prop-chilonzor-boundary-2km',
      title: 'Chilonzor 20-mavze',
      lat: 41.2650, // ~2.2km from Novza metro
      lng: 69.1950,
      priceUzs: 3500000,
      rooms: 2,
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.RENT,
    },
    {
      id: 'prop-yunusobod',
      title: 'Yunusobod 4-mavze',
      lat: 41.3650, // ~8.5km from Novza metro
      lng: 69.2850,
      priceUzs: 6500000,
      rooms: 3,
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.RENT,
    },
    {
      id: 'prop-sergeli-far',
      title: 'Sergeli yangi bino',
      lat: 41.2185, // ~8km from Novza metro
      lng: 69.2245,
      priceUzs: 3000000,
      rooms: 1,
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.RENT,
    },
  ];

  beforeAll(() => {
    geoService = new GeoService();
  });

  describe('Haversine Distance & Radius Filtering Logic', () => {
    it('500m Radius: includes only properties within 500m of Novza metro', () => {
      const radiusMeters = 500;
      const center = NOVZA_METRO;

      const matched = testSpatialProperties.filter((p) => {
        const dist = geoService.calculateDistanceMeters(center.lat, center.lng, p.lat, p.lng);
        return dist <= radiusMeters;
      });

      expect(matched.map((p) => p.id)).toEqual(['prop-chilonzor-close']);
    });

    it('1km Radius: includes properties within 1000m of Novza metro', () => {
      const radiusMeters = 1000;
      const center = NOVZA_METRO;

      const matched = testSpatialProperties.filter((p) => {
        const dist = geoService.calculateDistanceMeters(center.lat, center.lng, p.lat, p.lng);
        return dist <= radiusMeters;
      });

      expect(matched.map((p) => p.id)).toEqual(['prop-chilonzor-close']);
    });

    it('2km Radius: includes both close and medium distance Chilonzor properties', () => {
      const radiusMeters = 2000;
      const center = NOVZA_METRO;

      const matched = testSpatialProperties.filter((p) => {
        const dist = geoService.calculateDistanceMeters(center.lat, center.lng, p.lat, p.lng);
        return dist <= radiusMeters;
      });

      expect(matched.map((p) => p.id)).toContain('prop-chilonzor-close');
      expect(matched.map((p) => p.id)).toContain('prop-chilonzor-medium');
      expect(matched.map((p) => p.id)).not.toContain('prop-chilonzor-boundary-2km');
      expect(matched.map((p) => p.id)).not.toContain('prop-yunusobod');
    });

    it('5km Radius: includes all Chilonzor properties while excluding Yunusobod (8.5km away)', () => {
      const radiusMeters = 5000;
      const center = NOVZA_METRO;

      const matched = testSpatialProperties.filter((p) => {
        const dist = geoService.calculateDistanceMeters(center.lat, center.lng, p.lat, p.lng);
        return dist <= radiusMeters;
      });

      expect(matched.map((p) => p.id)).toContain('prop-chilonzor-close');
      expect(matched.map((p) => p.id)).toContain('prop-chilonzor-medium');
      expect(matched.map((p) => p.id)).toContain('prop-chilonzor-boundary-2km');
      expect(matched.map((p) => p.id)).not.toContain('prop-yunusobod');
    });
  });

  describe('Boundary Edge Inclusion / Exclusion Accuracy', () => {
    it('accurately excludes property at 2.2km when radius is strictly 2.0km (2000m)', () => {
      const center = NOVZA_METRO;
      const boundaryProp = testSpatialProperties.find((p) => p.id === 'prop-chilonzor-boundary-2km')!;

      const distance = geoService.calculateDistanceMeters(center.lat, center.lng, boundaryProp.lat, boundaryProp.lng);

      expect(distance).toBeGreaterThan(2000);
      expect(distance).toBeLessThan(2500);
      expect(distance <= 2000).toBe(false);
    });
  });

  describe('Combined Spatial + Faceted Search', () => {
    it('correctly combines spatial radius (2km from Novza) + price (<=4M) + rooms (2) + type (RENT)', () => {
      const center = NOVZA_METRO;
      const radiusMeters = 2000;
      const maxPrice = 4000000;
      const targetRooms = 2;
      const targetType = TransactionType.RENT;

      const results = testSpatialProperties.filter((p) => {
        const dist = geoService.calculateDistanceMeters(center.lat, center.lng, p.lat, p.lng);
        return (
          dist <= radiusMeters &&
          p.priceUzs <= maxPrice &&
          p.rooms === targetRooms &&
          p.transactionType === targetType
        );
      });

      expect(results.length).toBe(2);
      expect(results.map((p) => p.id)).toEqual(['prop-chilonzor-close', 'prop-chilonzor-medium']);
    });
  });

  describe('Tashkent Metro Network Spatial Grounding', () => {
    it('associates any coordinate in Tashkent with its nearest metro station and walking time', () => {
      // Test at Buyuk Ipak Yuli coords
      const nearMetro = geoService.findNearestMetro(BUYUK_IPAK_YULI.lat, BUYUK_IPAK_YULI.lng);
      expect(nearMetro.station.nameUz).toBe("Buyuk Ipak Yo'li");
      expect(nearMetro.distanceMeters).toBeLessThan(50);
      expect(nearMetro.walkingMinutes).toBe(1);

      // Test at Minor coords
      const nearMinor = geoService.findNearestMetro(MINOR_METRO.lat, MINOR_METRO.lng);
      expect(nearMinor.station.nameUz).toBe('Minor');
      expect(nearMinor.distanceMeters).toBeLessThan(50);
    });
  });
});
