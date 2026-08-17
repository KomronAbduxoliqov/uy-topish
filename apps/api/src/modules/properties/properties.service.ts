import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  OnModuleInit
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertyImageEntity } from '../../database/entities/property-image.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GeoService } from '../geo/geo.service';
import { SEED_PROPERTIES_DATA } from '../../database/seeds/tashkent-properties.seed';
import { ListingStatus, VerificationTier, UserRole } from '@uytop/shared-types';

@Injectable()
export class PropertiesService implements OnModuleInit {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(PropertyImageEntity)
    private imageRepository: Repository<PropertyImageEntity>,
    private geoService: GeoService,
  ) {}

  async onModuleInit() {
    await this.seedInitialDataIfEmpty();
  }

  private async seedInitialDataIfEmpty() {
    try {
      const count = await this.propertyRepository.count();
      if (count === 0) {
        this.logger.log('Database properties table is empty. Seeding initial Tashkent properties...');
        for (const data of SEED_PROPERTIES_DATA) {
          const { images, ...propertyData } = data;
          const property = this.propertyRepository.create(propertyData as any);
          const savedProperty = await this.propertyRepository.save(property);

          if (images && images.length > 0) {
            for (const img of images) {
              const imageEntity = this.imageRepository.create({
                ...img,
                propertyId: savedProperty.id
              });
              await this.imageRepository.save(imageEntity);
            }
          }
        }
        this.logger.log(`Successfully seeded ${SEED_PROPERTIES_DATA.length} initial properties.`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not run automatic seeds (will populate on DB connect): ${err.message}`);
    }
  }

  async create(dto: CreatePropertyDto, userId: string, userPhone?: string, userName?: string): Promise<PropertyEntity> {
    // Automatically calculate nearest metro and walking distance
    const nearestMetroInfo = this.geoService.findNearestMetro(dto.latitude, dto.longitude);

    // Approximate USD calculation if not provided (1 USD ~ 12,650 UZS)
    const priceUsd = dto.priceUsd || Math.round(dto.priceUzs / 12650);

    const property = this.propertyRepository.create({
      ...dto,
      ownerId: userId,
      priceUsd,
      nearestMetroStation: nearestMetroInfo.station.nameUz,
      nearestMetroDistanceMeters: nearestMetroInfo.distanceMeters,
      status: dto.status || ListingStatus.PENDING_MODERATION,
      verificationTier: VerificationTier.PHONE_VERIFIED,
      ownerPhone: dto.ownerPhone || userPhone || '+998901234567',
      ownerName: dto.ownerName || userName || 'Mulk egasi',
      publishedAt: new Date()
    });

    const saved = await this.propertyRepository.save(property);

    if (dto.images && dto.images.length > 0) {
      for (let i = 0; i < dto.images.length; i++) {
        const img = dto.images[i];
        const imageEntity = this.imageRepository.create({
          ...img,
          propertyId: saved.id,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : i,
          isCover: img.isCover !== undefined ? img.isCover : i === 0
        });
        await this.imageRepository.save(imageEntity);
      }
    }

    return this.findById(saved.id);
  }

  async findById(id: string): Promise<PropertyEntity> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['images']
    });

    if (!property) {
      throw new NotFoundException("Ko'chmas mulk e'loni topilmadi");
    }

    return property;
  }

  async incrementViews(id: string): Promise<void> {
    await this.propertyRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementContactClicks(id: string): Promise<void> {
    await this.propertyRepository.increment({ id }, 'contactClickCount', 1);
  }

  async update(id: string, dto: UpdatePropertyDto, userId: string, userRole: UserRole): Promise<PropertyEntity> {
    const property = await this.findById(id);

    if (property.ownerId !== userId && userRole !== UserRole.ADMIN && userRole !== UserRole.MODERATOR) {
      throw new ForbiddenException("Siz ushbu e'lonni tahrirlash huquqiga ega emassiz");
    }

    if (dto.latitude && dto.longitude) {
      const nearestMetroInfo = this.geoService.findNearestMetro(dto.latitude, dto.longitude);
      property.nearestMetroStation = nearestMetroInfo.station.nameUz;
      property.nearestMetroDistanceMeters = nearestMetroInfo.distanceMeters;
    }

    Object.assign(property, dto);
    await this.propertyRepository.save(property);

    return this.findById(id);
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<{ success: boolean; message: string }> {
    const property = await this.findById(id);

    if (property.ownerId !== userId && userRole !== UserRole.ADMIN && userRole !== UserRole.MODERATOR) {
      throw new ForbiddenException("Siz ushbu e'lonni o'chirish huquqiga ega emassiz");
    }

    await this.propertyRepository.remove(property);
    return { success: true, message: "E'lon muvaffaqiyatli o'chirildi" };
  }

  async checkDuplicatePotential(lat: number, lng: number, priceUzs: number, rooms: number): Promise<{ isDuplicate: boolean; duplicateCandidate?: PropertyEntity }> {
    const properties = await this.propertyRepository.find();
    for (const p of properties) {
      const distance = this.geoService.calculateDistanceMeters(lat, lng, Number(p.latitude), Number(p.longitude));
      const priceDiffPercent = Math.abs(p.priceUzs - priceUzs) / p.priceUzs;
      if (distance < 50 && p.rooms === rooms && priceDiffPercent < 0.15) {
        return { isDuplicate: true, duplicateCandidate: p };
      }
    }
    return { isDuplicate: false };
  }
}
