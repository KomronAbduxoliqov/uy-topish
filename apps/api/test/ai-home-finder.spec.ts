import { AiPreferencesEngine } from '../src/modules/ai-home-finder/ai-home-finder.preferences';
import { AiRankingEngine } from '../src/modules/ai-home-finder/ai-home-finder.ranking';
import {
  TransactionType,
  Property,
  PropertyType,
  ListingStatus,
  VerificationTier,
  RenovationType
} from '@uytop/shared-types';

describe('AI Personal Home Finder — Backend Engine', () => {
  describe('AiPreferencesEngine (Natural Language Parser)', () => {
    it('should parse natural Uzbek query with hard & soft requirements', () => {
      const query = "Chilonzorda 4 mln gacha 2 xonali mebelli kvartira kerak, metroga yaqin bo'lsin";
      const result = AiPreferencesEngine.parseTextToPreferences(query);

      expect(result.preferences.district).toBe('Chilonzor');
      expect(result.preferences.rooms).toEqual([2]);
      expect(result.preferences.maxPrice).toBe(4000000);
      expect(result.preferences.furnished).toBe(true);
      expect(result.preferences.nearMetro).toBe(true);
      expect(result.preferences.transactionType).toBe(TransactionType.RENT);
      expect(result.detectedLanguage).toBe('uz');
    });

    it('should parse Russian language requests accurately', () => {
      const query = "3 комнатная квартира до 5 млн на Юнусабаде рядом с метро";
      const result = AiPreferencesEngine.parseTextToPreferences(query);

      expect(result.preferences.district).toBe('Yunusobod');
      expect(result.preferences.rooms).toEqual([3]);
      expect(result.preferences.maxPrice).toBe(5000000);
      expect(result.preferences.nearMetro).toBe(true);
      expect(result.detectedLanguage).toBe('ru');
    });

    it('should detect landmark & workplace requirements', () => {
      const query = "Ish joyim Tashkent City, 6 milliongacha 2 xonali";
      const result = AiPreferencesEngine.parseTextToPreferences(query);

      expect(result.preferences.workLocation?.name).toBe('Tashkent City');
      expect(result.preferences.maxPrice).toBe(6000000);
      expect(result.preferences.rooms).toEqual([2]);
    });

    it('should trigger clarification for family school/kindergarten needs', () => {
      const query = "Oilamiz 4 kishilik, Chilonzorda 5 milliongacha uy kerak";
      const result = AiPreferencesEngine.parseTextToPreferences(query);

      expect(result.preferences.familySize).toBe(4);
      expect(result.requiresClarification).toBe(true);
      expect(result.clarificationTopic).toBe('school');
    });

    it('should apply quick 1-click refinements properly', () => {
      const initial = {
        maxPrice: 4000000,
        rooms: [2],
        district: 'Chilonzor',
      };

      const budgetRefined = AiPreferencesEngine.applyRefinement(initial, 'INCREASE_BUDGET_500K');
      expect(budgetRefined.maxPrice).toBe(4500000);

      const metroRefined = AiPreferencesEngine.applyRefinement(initial, 'CLOSER_TO_METRO');
      expect(metroRefined.nearMetro).toBe(true);
      expect(metroRefined.maxWalkingMinutes).toBe(7);

      const furnishedRefined = AiPreferencesEngine.applyRefinement(initial, 'ONLY_FURNISHED');
      expect(furnishedRefined.furnished).toBe(true);
    });
  });

  describe('AiRankingEngine (Transparent Grounded Scoring)', () => {
    const mockProperties: Property[] = [
      {
        id: 'prop-1',
        ownerId: 'owner-1',
        titleUz: 'Chilonzorda shinam 2 xonali kvartira',
        descriptionUz: 'Ajoyib joylashuv, Novza metrosi 400m',
        transactionType: TransactionType.RENT,
        propertyType: PropertyType.APARTMENT,
        priceUzs: 3800000,
        priceUsd: 300,
        rooms: 2,
        areaSqm: 65,
        addressLine: 'Qatortol ko\'chasi',
        city: 'Toshkent',
        district: 'Chilonzor',
        latitude: 41.2721,
        longitude: 69.2045,
        furnished: true,
        renovation: RenovationType.NEW,
        amenities: { parking: true, elevator: true },
        images: [],
        status: ListingStatus.PUBLISHED,
        verificationTier: VerificationTier.INSPECTED,
        viewCount: 10,
        contactClickCount: 2,
        nearestMetroStation: 'Novza',
        nearestMetroDistanceMeters: 350,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prop-2',
        ownerId: 'owner-2',
        titleUz: 'Yunusobodda 3 xonali kvartira',
        descriptionUz: 'Katta maydon, mebelsiz',
        transactionType: TransactionType.RENT,
        propertyType: PropertyType.APARTMENT,
        priceUzs: 5500000,
        priceUsd: 440,
        rooms: 3,
        areaSqm: 85,
        addressLine: 'Amir Temur ko\'chasi',
        city: 'Toshkent',
        district: 'Yunusobod',
        latitude: 41.3654,
        longitude: 69.2887,
        furnished: false,
        renovation: RenovationType.AVERAGE,
        amenities: {},
        images: [],
        status: ListingStatus.PUBLISHED,
        verificationTier: VerificationTier.DOCS_VERIFIED,
        viewCount: 5,
        contactClickCount: 1,
        nearestMetroStation: 'Shahriston',
        nearestMetroDistanceMeters: 1100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    it('should rank properties and calculate grounded match scores', () => {
      const preferences = {
        district: 'Chilonzor',
        maxPrice: 4000000,
        rooms: [2],
        furnished: true,
        nearMetro: true,
      };

      const ranked = AiRankingEngine.rankProperties(mockProperties, preferences);

      expect(ranked.length).toBe(2);
      // Property 1 matches district, budget, rooms, metro, furnished, inspected
      expect(ranked[0].property.id).toBe('prop-1');
      expect(ranked[0].matchScore).toBeGreaterThanOrEqual(90);
      expect(ranked[0].matchReasons).toContain("Budjetingiz ichida");
      expect(ranked[0].matchReasons).toContain("2 xonali mos xonadon");
      expect(ranked[0].breakdown.priceScore).toBeGreaterThanOrEqual(90);
      expect(ranked[0].breakdown.locationScore).toBe(100);

      // Property 2 is overbudget, wrong district, wrong rooms -> lower score
      expect(ranked[1].property.id).toBe('prop-2');
      expect(ranked[1].matchScore).toBeLessThan(ranked[0].matchScore);
    });

    it('should adapt scoring dynamically based on importance weights', () => {
      const priceDrivenPreferences = {
        maxPrice: 4000000,
        importanceWeights: {
          price: 50,
          location: 10,
          rooms: 10,
          metro: 10,
          area: 10,
          amenities: 5,
          verification: 5,
        },
      };

      const ranked = AiRankingEngine.rankProperties(mockProperties, priceDrivenPreferences);
      expect(ranked[0].breakdown.priceScore).toBeGreaterThan(80);
    });
  });
});
