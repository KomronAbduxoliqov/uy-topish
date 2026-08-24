import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { PropertyEntity } from '../../database/entities/property.entity';
import { ModerationLogEntity } from '../../database/entities/moderation-log.entity';
import { PropertiesService } from '../properties/properties.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListingStatus, VerificationTier } from '@uytop/shared-types';

describe('ModerationService (Unit Tests)', () => {
  let service: ModerationService;
  let mockPropertyRepo: any;
  let mockLogRepo: any;
  let mockPropertiesService: any;

  beforeEach(async () => {
    mockPropertyRepo = {
      find: jest.fn(),
      save: jest.fn().mockImplementation((prop) => Promise.resolve(prop)),
    };

    mockLogRepo = {
      create: jest.fn().mockImplementation((log) => log),
      save: jest.fn().mockImplementation((log) => Promise.resolve(log)),
    };

    mockPropertiesService = {
      findById: jest.fn().mockResolvedValue({
        id: 'prop-1',
        status: ListingStatus.PENDING_MODERATION,
        verificationTier: VerificationTier.PHONE_VERIFIED,
      }),
      checkDuplicatePotential: jest.fn().mockResolvedValue({ isDuplicate: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        {
          provide: getRepositoryToken(PropertyEntity),
          useValue: mockPropertyRepo,
        },
        {
          provide: getRepositoryToken(ModerationLogEntity),
          useValue: mockLogRepo,
        },
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  it('approves listing, changes status to PUBLISHED, and writes moderation audit log', async () => {
    const result = await service.approveListing('prop-1', 'moderator-123');

    expect(result.status).toBe(ListingStatus.PUBLISHED);
    expect(mockPropertyRepo.save).toHaveBeenCalled();
    expect(mockLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyId: 'prop-1',
        moderatorId: 'moderator-123',
        action: 'APPROVED',
      })
    );
  });

  it('rejects listing, sets status to REJECTED, and records rejection reason in audit log', async () => {
    const result = await service.rejectListing('prop-1', 'moderator-123', 'Noto\'g\'ri narx yoki soxta rasm');

    expect(result.status).toBe(ListingStatus.REJECTED);
    expect(mockLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyId: 'prop-1',
        action: 'REJECTED',
        reason: 'Noto\'g\'ri narx yoki soxta rasm',
      })
    );
  });

  it('updates verification tier to INSPECTED with audit trail', async () => {
    const result = await service.setVerificationTier('prop-1', 'moderator-123', VerificationTier.INSPECTED);

    expect(result.verificationTier).toBe(VerificationTier.INSPECTED);
    expect(mockLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'VERIFIED',
      })
    );
  });
});
