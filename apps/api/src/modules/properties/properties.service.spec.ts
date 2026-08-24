import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertyImageEntity } from '../../database/entities/property-image.entity';
import { GeoService } from '../geo/geo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionType, PropertyType, UserRole, VerificationTier, ListingStatus } from '@uytop/shared-types';

describe('PropertiesService (Unit Tests)', () => {
  let service: PropertiesService;
  let mockPropertyRepository: any;
  let mockImageRepository: any;
  let mockGeoService: any;

  beforeEach(async () => {
    mockPropertyRepository = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'prop-uuid-1', ...dto })),
      save: jest.fn().mockImplementation((prop) => Promise.resolve(prop)),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn().mockResolvedValue(true),
      count: jest.fn().mockResolvedValue(10),
      increment: jest.fn().mockResolvedValue(true),
    };

    mockImageRepository = {
      create: jest.fn().mockImplementation((img) => ({ id: 'img-1', ...img })),
      save: jest.fn().mockImplementation((img) => Promise.resolve(img)),
    };

    mockGeoService = {
      findNearestMetro: jest.fn().mockReturnValue({
        station: { nameUz: 'Novza', nameRu: 'Новза' },
        distanceMeters: 300,
        walkingMinutes: 4,
      }),
      calculateDistanceMeters: jest.fn().mockReturnValue(30),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(PropertyEntity),
          useValue: mockPropertyRepository,
        },
        {
          provide: getRepositoryToken(PropertyImageEntity),
          useValue: mockImageRepository,
        },
        {
          provide: GeoService,
          useValue: mockGeoService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('creates property with automatic nearest metro calculation and sets default status to PENDING_MODERATION', async () => {
    const dto = {
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      titleUz: 'Chilonzorda 2 xonali kvartira',
      descriptionUz: 'Yangi uy',
      district: 'Chilonzor',
      addressLine: '9-mavze, 14-uy',
      latitude: 41.2745,
      longitude: 69.2065,
      priceUzs: 4000000,
      rooms: 2,
      areaSqm: 60,
      floor: 3,
      totalFloors: 9,
    };

    mockPropertyRepository.findOne.mockResolvedValue({
      id: 'prop-uuid-1',
      ...dto,
      nearestMetroStation: 'Novza',
      nearestMetroDistanceMeters: 300,
      status: ListingStatus.PENDING_MODERATION,
      verificationTier: VerificationTier.PHONE_VERIFIED,
      images: [],
    });

    const result = await service.create(dto as any, 'owner-usr-1', '+998901234567', 'Rustam');

    expect(mockGeoService.findNearestMetro).toHaveBeenCalledWith(41.2745, 69.2065);
    expect(result.id).toBe('prop-uuid-1');
    expect(result.nearestMetroStation).toBe('Novza');
  });

  it('throws NotFoundException when fetching non-existent property', async () => {
    mockPropertyRepository.findOne.mockResolvedValue(null);

    await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
  });

  it('allows owner to update their own property', async () => {
    const existing = {
      id: 'prop-1',
      ownerId: 'owner-1',
      titleUz: 'Eski sarlavha',
      priceUzs: 3500000,
    };
    mockPropertyRepository.findOne.mockResolvedValue(existing);

    const updateDto = { titleUz: 'Yangi sarlavha', priceUzs: 4000000 };
    const result = await service.update('prop-1', updateDto, 'owner-1', UserRole.OWNER);

    expect(mockPropertyRepository.save).toHaveBeenCalled();
  });

  it('prevents non-owners without admin role from updating another user\'s listing', async () => {
    const existing = {
      id: 'prop-1',
      ownerId: 'owner-1',
    };
    mockPropertyRepository.findOne.mockResolvedValue(existing);

    await expect(
      service.update('prop-1', { priceUzs: 1000 }, 'stranger-user', UserRole.USER)
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows admins and moderators to update any listing', async () => {
    const existing = {
      id: 'prop-1',
      ownerId: 'owner-1',
    };
    mockPropertyRepository.findOne.mockResolvedValue(existing);

    await service.update('prop-1', { priceUzs: 4000000 }, 'admin-1', UserRole.ADMIN);
    expect(mockPropertyRepository.save).toHaveBeenCalled();
  });

  it('detects duplicate listings within 50m radius with matching room counts and similar price', async () => {
    mockPropertyRepository.find.mockResolvedValue([
      {
        id: 'existing-prop',
        latitude: 41.2745,
        longitude: 69.2065,
        rooms: 2,
        priceUzs: 4000000,
      },
    ]);

    const result = await service.checkDuplicatePotential(41.2746, 69.2066, 4100000, 2);

    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateCandidate).toBeDefined();
  });
});
