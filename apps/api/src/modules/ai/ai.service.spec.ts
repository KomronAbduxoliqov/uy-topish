import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { SearchService } from '../search/search.service';
import { TransactionType, PropertyType } from '@uytop/shared-types';

describe('AiService (Intent Parser & Query Grounding)', () => {
  let service: AiService;
  let mockSearchService: any;

  beforeEach(async () => {
    mockSearchService = {
      searchProperties: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'mock-prop-1',
            titleUz: 'Chilonzor 9-mavze',
            priceUzs: 3800000,
            district: 'Chilonzor',
            rooms: 2,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  describe('Natural Language Intent Parsing', () => {
    it('parses: "Chilonzorda 4 mln gacha 2 xonali mebelli kvartira"', () => {
      const result = service.parseUserIntent('Chilonzorda 4 mln gacha 2 xonali mebelli kvartira');

      expect(result.district).toBe('Chilonzor');
      expect(result.rooms).toBe(2);
      expect(result.maxPrice).toBe(4000000);
      expect(result.furnished).toBe(true);
      expect(result.propertyType).toBe(PropertyType.APARTMENT);
      expect(result.transactionType).toBe(TransactionType.RENT);
      expect(result.explanationUz).toContain('Chilonzor');
    });

    it('parses: "Novza metrosi yaqinidan 3 xonali uy kerak"', () => {
      const result = service.parseUserIntent('Novza metrosi yaqinidan 3 xonali uy kerak');

      expect(result.rooms).toBe(3);
      expect(result.nearMetro).toBe(true);
      expect(result.metroStationName).toBe('Novza');
      expect(result.centerLat).toBeDefined();
      expect(result.centerLng).toBeDefined();
    });

    it('parses: "3 mln gacha kvartira"', () => {
      const result = service.parseUserIntent('3 mln gacha kvartira');

      expect(result.maxPrice).toBe(3000000);
      expect(result.propertyType).toBe(PropertyType.APARTMENT);
    });

    it('parses Russian query: "2 комнатная квартира на Чиланзаре до 4 млн"', () => {
      const result = service.parseUserIntent('2 комнатная квартира на Чиланзаре до 4 млн');

      expect(result.detectedLanguage).toBe('ru');
      expect(result.rooms).toBe(2);
      expect(result.district).toBe('Chilonzor');
      expect(result.maxPrice).toBe(4000000);
      expect(result.explanationRu).toBeDefined();
    });

    it('parses USD currency intent: "Yunusobodda 400$ 2 xonali"', () => {
      const result = service.parseUserIntent('Yunusobodda 400$ 2 xonali');

      expect(result.district).toBe('Yunusobod');
      expect(result.rooms).toBe(2);
      expect(result.maxPrice).toBe(400 * 12650);
    });

    it('parses Sale intent: "Chilonzorda uy sotib olmoqchiman"', () => {
      const result = service.parseUserIntent('Chilonzorda uy sotib olmoqchiman');

      expect(result.district).toBe('Chilonzor');
      expect(result.transactionType).toBe(TransactionType.SALE);
    });
  });

  describe('Grounded Search & Anti-Hallucination', () => {
    it('executes database search using structured intent and does not invent fake records', async () => {
      const query = 'Chilonzorda 4 mln gacha 2 xonali';
      const result = await service.processSearchQuery(query);

      expect(mockSearchService.searchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          district: 'Chilonzor',
          rooms: [2],
          maxPrice: 4000000,
        })
      );

      expect(result.total).toBe(1);
      expect(result.properties[0].id).toBe('mock-prop-1');
      expect(result.aiCommentaryUz).toContain('1 ta haqiqiy va tekshirilgan');
    });

    it('generates structured listing text without fake contact details', () => {
      const notes = 'Chilonzorda 2 xonali yangi evro remont mebellari bilan';
      const listing = service.generateListingContent(notes);

      expect(listing.titleUz).toContain('Chilonzor');
      expect(listing.descriptionUz).toBeDefined();
      expect(listing.suggestedAmenities).toContain('furnished');
      expect(listing.suggestedAmenities).toContain('air_conditioner');
    });
  });
});
