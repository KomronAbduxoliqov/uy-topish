import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import {
  TransactionType,
  PropertyType,
  RenovationType,
  BuildingType,
  ListingStatus,
  VerificationTier
} from '@uytop/shared-types';
import { PropertyImageEntity } from './property-image.entity';

@Entity('properties')
@Index(['city', 'district'])
@Index(['transactionType', 'propertyType'])
@Index(['priceUzs', 'status'])
@Index(['latitude', 'longitude'])
export class PropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column({ nullable: true })
  agentId?: string;

  @Column({ nullable: true })
  agencyId?: string;

  @Column()
  titleUz: string;

  @Column({ nullable: true })
  titleRu?: string;

  @Column({ type: 'text' })
  descriptionUz: string;

  @Column({ type: 'text', nullable: true })
  descriptionRu?: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.RENT
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.APARTMENT
  })
  propertyType: PropertyType;

  @Column({ type: 'bigint' })
  priceUzs: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  priceUsd: number;

  @Column({ type: 'int', default: 1 })
  rooms: number;

  @Column({ type: 'int', nullable: true })
  bedrooms?: number;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  areaSqm: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  livingAreaSqm?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  landAreaSotix?: number;

  @Column({ type: 'int', nullable: true })
  floor?: number;

  @Column({ type: 'int', nullable: true })
  totalFloors?: number;

  @Column({
    type: 'enum',
    enum: RenovationType,
    default: RenovationType.RENOVATED
  })
  renovation: RenovationType;

  @Column({ default: false })
  furnished: boolean;

  @Column({
    type: 'enum',
    enum: BuildingType,
    nullable: true
  })
  buildingType?: BuildingType;

  @Column({ type: 'int', nullable: true })
  yearBuilt?: number;

  @Column()
  addressLine: string;

  @Column({ default: 'Toshkent' })
  city: string;

  @Column()
  district: string;

  @Column({ nullable: true })
  mahalla?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'jsonb', default: {} })
  amenities: Record<string, boolean>;

  @OneToMany(() => PropertyImageEntity, (image) => image.property, { cascade: true, eager: true })
  images: PropertyImageEntity[];

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.PENDING_MODERATION
  })
  status: ListingStatus;

  @Column({
    type: 'enum',
    enum: VerificationTier,
    default: VerificationTier.UNVERIFIED
  })
  verificationTier: VerificationTier;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  contactClickCount: number;

  @Column({ nullable: true })
  nearestMetroStation?: string;

  @Column({ type: 'int', nullable: true })
  nearestMetroDistanceMeters?: number;

  @Column({ nullable: true })
  ownerPhone?: string;

  @Column({ nullable: true })
  ownerName?: string;

  @Column({ nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
