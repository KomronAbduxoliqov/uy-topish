import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { ListingStatus, UserRole } from '@uytop/shared-types';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getDashboardStats() {
    const totalProperties = await this.propertyRepository.count();
    const publishedProperties = await this.propertyRepository.count({
      where: { status: ListingStatus.PUBLISHED }
    });
    const pendingProperties = await this.propertyRepository.count({
      where: { status: ListingStatus.PENDING_MODERATION }
    });
    const totalUsers = await this.userRepository.count();
    const totalAgents = await this.userRepository.count({
      where: { role: UserRole.AGENT }
    });

    const viewsResult = await this.propertyRepository
      .createQueryBuilder('p')
      .select('SUM(p.viewCount)', 'totalViews')
      .addSelect('SUM(p.contactClickCount)', 'totalContacts')
      .getRawOne();

    const districtBreakdown = await this.propertyRepository
      .createQueryBuilder('p')
      .select('p.district', 'district')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('p.district')
      .getRawMany();

    return {
      metrics: {
        totalProperties,
        publishedProperties,
        pendingProperties,
        totalUsers,
        totalAgents,
        totalViews: parseInt(viewsResult?.totalViews || '0', 10),
        totalContacts: parseInt(viewsResult?.totalContacts || '0', 10),
      },
      districtBreakdown
    };
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserEntity> {
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
    user.role = role;
    return this.userRepository.save(user);
  }
}
