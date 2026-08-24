import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PropertyEntity } from '../../database/entities/property.entity';
import { GeoService } from '../geo/geo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionType, PropertyType, ListingStatus, VerificationTier } from '@uytop/shared-types';

describe('SearchService (Unit Tests)', () => {
  let service: SearchService;
  let mockQueryBuilder: any;
  let mockPropertyRepo: any;
  let mockGeoService: any;

  const mockDatabaseProperties = [
    {
      id: 'prop-1',
      titleUz: 'Chilonzor 9-mavze 2 xonali',
      titleRu: 'Чиланзар 9-квартал 2-комнатная',
      district: 'Chilonzor',
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      priceUzs: 4000000,
      rooms: 2,
      latitude: 41.2745,
      longitude: 69.2065,
      furnished: true,
      nearestMetroStation: 'Novza',
      nearestMetroDistanceMeters: 300,
      status: ListingStatus.PUBLISHED,
      verificationTier: VerificationTier.DOCS_VERIFIED,
      createdAt: new Date('2026-08-01'),
    },
    {
      id: 'prop-2',
      titleUz: 'Yunusobod 4-mavze 3 xonali',
      titleRu: 'Юнусабад 4-квартал 3-комнатная',
      district: 'Yunusobod',
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      priceUzs: 7000000,
      rooms: 3,
      latitude: 41.3650,
      longitude: 69.2850,
      furnished: false,
      nearestMetroStation: 'Shahriston',
      nearestMetroDistanceMeters: 950,
      status: ListingStatus.PUBLISHED,
      verificationTier: VerificationTier.PHONE_VERIFIED,
      createdAt: new Date('2026-08-02'),
    },
  ];

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockDatabaseProperties),
    };

    mockPropertyRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockGeoService = {
      calculateDistanceMeters: jest.fn().mockImplementation((lat1, lon1, lat2, lon2) => {
        // Simple distance mock
        if (Math.abs(lat1 - lat2) < 0.05 && Math.abs(lon1 - lon2) < 0.05) {
          return 400; // close
        }
        return 12000; // far
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(PropertyEntity),
          useValue: mockPropertyRepo,
        },
        {
          provide: GeoService,
          useValue: mockGeoService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('searches properties with faceted filters (transactionType, district, maxPrice, rooms)', async () => {
    const result = await service.searchProperties({
      transactionType: TransactionType.RENT,
      district: 'Chilonzor',
      rooms: [2],
      maxPrice: 4500000,
    });

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('p.transactionType = :transactionType', {
      transactionType: TransactionType.RENT,
    });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(p.district) LIKE LOWER(:district)', {
      district: '%Chilonzor%',
    });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('p.rooms IN (:...rooms)', { rooms: [2] });
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('applies Great-Circle spatial radius filter when coordinates are specified', async () => {
    const result = await service.searchProperties({
      centerLat: 41.2745,
      centerLng: 69.2065,
      radiusMeters: 1000,
      sortBy: 'distance',
    });

    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe('prop-1');
  });

  it('enriches search results with dynamic UX match reasons', async () => {
    const result = await service.searchProperties({
      maxPrice: 4000000,
    });

    const prop1 = result.items.find((p) => p.id === 'prop-1');
    expect(prop1?.matchReasons).toBeDefined();
    expect(prop1?.matchReasons?.some((r) => r.includes('Novza'))).toBe(true);
    expect(prop1?.matchReasons?.some((r) => r.includes('mebellar'))).toBe(true);
  });
});
