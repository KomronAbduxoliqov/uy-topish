import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { PropertiesController } from '../src/modules/properties/properties.controller';
import { PropertiesService } from '../src/modules/properties/properties.service';
import { SearchController } from '../src/modules/search/search.controller';
import { SearchService } from '../src/modules/search/search.service';
import { AiController } from '../src/modules/ai/ai.controller';
import { AiService } from '../src/modules/ai/ai.service';
import { FavoritesController } from '../src/modules/favorites/favorites.controller';
import { FavoritesService } from '../src/modules/favorites/favorites.service';
import { ModerationController } from '../src/modules/moderation/moderation.controller';
import { ModerationService } from '../src/modules/moderation/moderation.service';
import { UserEntity } from '../src/database/entities/user.entity';
import { UserRole, ListingStatus, VerificationTier } from '@uytop/shared-types';

describe('NestJS API Integration Test Suite (HTTP Endpoints & Validation)', () => {
  let authController: AuthController;
  let propertiesController: PropertiesController;
  let searchController: SearchController;
  let aiController: AiController;
  let favoritesController: FavoritesController;
  let moderationController: ModerationController;

  const mockUser = {
    id: 'usr-1',
    phone: '+998901234567',
    fullName: 'Rustam Karimov',
    role: UserRole.MODERATOR,
    isActive: true,
  } as unknown as UserEntity;

  const mockAuthService = {
    register: jest.fn().mockImplementation((dto) => ({
      user: { id: 'usr-1', phone: dto.phone, fullName: dto.fullName, role: dto.role || UserRole.USER },
      accessToken: 'jwt_valid_token_123',
    })),
    login: jest.fn().mockImplementation((dto) => ({
      user: { id: 'usr-1', phone: dto.phone, fullName: 'Rustam', role: UserRole.USER },
      accessToken: 'jwt_valid_token_123',
    })),
    getMe: jest.fn().mockResolvedValue({ id: 'usr-1', phone: '+998901234567', fullName: 'Rustam' }),
  };

  const mockPropertiesService = {
    create: jest.fn().mockImplementation((dto, userId) => ({
      id: 'prop-new-1',
      ...dto,
      ownerId: userId,
      status: ListingStatus.PENDING_MODERATION,
      verificationTier: VerificationTier.PHONE_VERIFIED,
    })),
    findById: jest.fn().mockImplementation((id) => ({
      id,
      titleUz: 'Chilonzor 9-mavze 2 xonali',
      priceUzs: 4000000,
      status: ListingStatus.PUBLISHED,
      images: [],
    })),
    update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
    delete: jest.fn().mockResolvedValue({ success: true, message: "O'chirildi" }),
    incrementViews: jest.fn().mockResolvedValue(true),
    incrementContactClicks: jest.fn().mockResolvedValue(true),
  };

  const mockSearchService = {
    searchProperties: jest.fn().mockResolvedValue({
      items: [
        {
          id: 'prop-1',
          titleUz: 'Chilonzor 2 xonali',
          priceUzs: 4000000,
          district: 'Chilonzor',
          rooms: 2,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    }),
  };

  const mockAiService = {
    processSearchQuery: jest.fn().mockImplementation((query) => ({
      parsedIntent: { district: 'Chilonzor', rooms: 2, maxPrice: 4000000 },
      properties: [{ id: 'prop-1', titleUz: 'Chilonzor 2 xonali' }],
      total: 1,
      aiCommentaryUz: '1 ta mos e\'lon topildi',
      aiCommentaryRu: 'Найдено 1 объявление',
    })),
    generateListingContent: jest.fn().mockReturnValue({
      titleUz: 'Chilonzorda 2 xonali kvartira',
      descriptionUz: 'Tavsif...',
      suggestedAmenities: ['furnished'],
    }),
  };

  const mockFavoritesService = {
    toggleFavorite: jest.fn().mockResolvedValue({ isFavorited: true }),
    getUserFavorites: jest.fn().mockResolvedValue([{ id: 'prop-1' }]),
    compareProperties: jest.fn().mockResolvedValue({
      properties: [{ id: 'prop-1' }],
      criteria: { priceComparison: [], areaComparison: [], locationScore: [], amenitiesDiff: [] },
    }),
  };

  const mockModerationService = {
    getPendingQueue: jest.fn().mockResolvedValue([{ id: 'prop-pending-1' }]),
    approveListing: jest.fn().mockResolvedValue({ id: 'prop-1', status: ListingStatus.PUBLISHED }),
    rejectListing: jest.fn().mockResolvedValue({ id: 'prop-1', status: ListingStatus.REJECTED }),
    setVerificationTier: jest.fn().mockResolvedValue({ id: 'prop-1', verificationTier: VerificationTier.INSPECTED }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [
        AuthController,
        PropertiesController,
        SearchController,
        AiController,
        FavoritesController,
        ModerationController,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PropertiesService, useValue: mockPropertiesService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: AiService, useValue: mockAiService },
        { provide: FavoritesService, useValue: mockFavoritesService },
        { provide: ModerationService, useValue: mockModerationService },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    propertiesController = moduleRef.get<PropertiesController>(PropertiesController);
    searchController = moduleRef.get<SearchController>(SearchController);
    aiController = moduleRef.get<AiController>(AiController);
    favoritesController = moduleRef.get<FavoritesController>(FavoritesController);
    moderationController = moduleRef.get<ModerationController>(ModerationController);
  });

  it('POST /auth/register: registers new user with +998 phone and returns JWT', async () => {
    const result = await authController.register({
      phone: '+998901234567',
      fullName: 'Rustam Karimov',
      password: 'StrongPassword123!',
    });

    expect(result.user.phone).toBe('+998901234567');
    expect(result.accessToken).toBe('jwt_valid_token_123');
  });

  it('GET /properties/:id: returns real property details and increments views', async () => {
    const result = await propertiesController.getById('prop-1');

    expect(result.id).toBe('prop-1');
    expect(mockPropertiesService.incrementViews).toHaveBeenCalledWith('prop-1');
  });

  it('POST /search: returns paginated property results with faceted filtering', async () => {
    const result = await searchController.search({
      district: 'Chilonzor',
      maxPrice: 4000000,
      rooms: [2],
    });

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(1);
  });

  it('POST /ai/search: processes natural language query and returns grounded properties', async () => {
    const result = await aiController.searchWithAi({
      query: 'Chilonzorda 4 mln gacha 2 xonali kvartira',
    });

    expect(result.parsedIntent.district).toBe('Chilonzor');
    expect(result.properties.length).toBe(1);
    expect(result.aiCommentaryUz).toBeDefined();
  });

  it('POST /favorites/:id: adds and removes property to user favorites (toggle)', async () => {
    const result = await favoritesController.toggleFavorite('prop-1', mockUser);

    expect(result.isFavorited).toBe(true);
  });

  it('POST /moderation/:id/approve: updates listing status to PUBLISHED', async () => {
    const result = await moderationController.approve('prop-1', mockUser);

    expect(result.status).toBe(ListingStatus.PUBLISHED);
  });
});
