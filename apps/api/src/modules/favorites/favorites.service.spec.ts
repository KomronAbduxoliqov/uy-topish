import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { FavoriteEntity } from '../../database/entities/favorite.entity';
import { PropertyEntity } from '../../database/entities/property.entity';
import { GeoService } from '../geo/geo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('FavoritesService & Comparison (Unit Tests)', () => {
  let service: FavoritesService;
  let mockFavoriteRepo: any;
  let mockPropertyRepo: any;
  let mockGeoService: any;

  beforeEach(async () => {
    mockFavoriteRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((fav) => Promise.resolve(fav)),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockPropertyRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockGeoService = {
      calculateDistanceMeters: jest.fn().mockReturnValue(1500),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(FavoriteEntity),
          useValue: mockFavoriteRepo,
        },
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

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('toggles favorite on when not previously favorited', async () => {
    mockFavoriteRepo.findOne.mockResolvedValue(null);
    mockPropertyRepo.findOne.mockResolvedValue({ id: 'prop-1' });

    const result = await service.toggleFavorite('usr-1', 'prop-1');

    expect(result.isFavorited).toBe(true);
    expect(mockFavoriteRepo.save).toHaveBeenCalled();
  });

  it('toggles favorite off when already favorited', async () => {
    mockFavoriteRepo.findOne.mockResolvedValue({ id: 'fav-1', userId: 'usr-1', propertyId: 'prop-1' });

    const result = await service.toggleFavorite('usr-1', 'prop-1');

    expect(result.isFavorited).toBe(false);
    expect(mockFavoriteRepo.remove).toHaveBeenCalled();
  });

  it('throws NotFoundException if favoriting a non-existent property', async () => {
    mockFavoriteRepo.findOne.mockResolvedValue(null);
    mockPropertyRepo.findOne.mockResolvedValue(null);

    await expect(service.toggleFavorite('usr-1', 'invalid-prop-id')).rejects.toThrow(NotFoundException);
  });

  it('computes property comparison matrix (lowest price/m², largest area, amenities)', async () => {
    mockPropertyRepo.find.mockResolvedValue([
      {
        id: 'prop-1',
        titleUz: 'Chilonzor 2 xona',
        priceUzs: 4000000,
        areaSqm: 60, // 66,667 so'm/m2
        latitude: 41.2745,
        longitude: 69.2065,
        amenities: { furnished: true, air_conditioner: true },
      },
      {
        id: 'prop-2',
        titleUz: 'Yunusobod 3 xona',
        priceUzs: 9000000,
        areaSqm: 100, // 90,000 so'm/m2
        latitude: 41.3650,
        longitude: 69.2850,
        amenities: { furnished: true, air_conditioner: false },
      },
    ]);

    const result = await service.compareProperties(['prop-1', 'prop-2']);

    expect(result.properties.length).toBe(2);
    expect(result.criteria.priceComparison.find((p) => p.id === 'prop-1')?.isLowest).toBe(true);
    expect(result.criteria.areaComparison.find((p) => p.id === 'prop-2')?.isLargest).toBe(true);
    expect(result.criteria.amenitiesDiff.length).toBeGreaterThan(0);
  });
});
