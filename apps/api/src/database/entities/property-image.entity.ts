import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { PropertyEntity } from './property.entity';

@Entity('property_images')
export class PropertyImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: string;

  @ManyToOne(() => PropertyEntity, (property) => property.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @Column()
  originalUrl: string;

  @Column()
  webpUrl: string;

  @Column()
  thumbnailUrl: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: false })
  isCover: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
