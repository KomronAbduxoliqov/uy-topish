import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { ModerationLogEntity } from '../../database/entities/moderation-log.entity';
import { ListingStatus, VerificationTier } from '@uytop/shared-types';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(ModerationLogEntity)
    private logRepository: Repository<ModerationLogEntity>,
    private propertiesService: PropertiesService,
  ) {}

  async getPendingQueue(): Promise<PropertyEntity[]> {
    return this.propertyRepository.find({
      where: { status: ListingStatus.PENDING_MODERATION },
      relations: ['images'],
      order: { createdAt: 'ASC' }
    });
  }

  async approveListing(propertyId: string, moderatorId: string): Promise<PropertyEntity> {
    const property = await this.propertiesService.findById(propertyId);
    property.status = ListingStatus.PUBLISHED;
    property.publishedAt = new Date();
    const updated = await this.propertyRepository.save(property);

    const log = this.logRepository.create({
      propertyId,
      moderatorId,
      action: 'APPROVED'
    });
    await this.logRepository.save(log);

    return updated;
  }

  async rejectListing(propertyId: string, moderatorId: string, reason: string): Promise<PropertyEntity> {
    const property = await this.propertiesService.findById(propertyId);
    property.status = ListingStatus.REJECTED;
    const updated = await this.propertyRepository.save(property);

    const log = this.logRepository.create({
      propertyId,
      moderatorId,
      action: 'REJECTED',
      reason
    });
    await this.logRepository.save(log);

    return updated;
  }

  async setVerificationTier(propertyId: string, moderatorId: string, tier: VerificationTier): Promise<PropertyEntity> {
    const property = await this.propertiesService.findById(propertyId);
    property.verificationTier = tier;
    const updated = await this.propertyRepository.save(property);

    const log = this.logRepository.create({
      propertyId,
      moderatorId,
      action: 'VERIFIED',
      reason: `Verification tier set to ${tier}`
    });
    await this.logRepository.save(log);

    return updated;
  }

  async analyzeDuplicates(propertyId: string) {
    const property = await this.propertiesService.findById(propertyId);
    return this.propertiesService.checkDuplicatePotential(
      Number(property.latitude),
      Number(property.longitude),
      Number(property.priceUzs),
      Number(property.rooms)
    );
  }
}
