import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { PropertyEntity } from './property.entity';
import { PropertyReportReason } from '@uytop/shared-types';

@Entity('property_reports')
export class PropertyReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  propertyId: string;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @Column({ nullable: true })
  reporterPhone?: string;

  @Column({ nullable: true })
  reporterId?: string;

  @Column({
    type: 'varchar',
    length: 40,
    default: 'OTHER'
  })
  reason: PropertyReportReason;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'OPEN'
  })
  status: 'OPEN' | 'REVIEWED' | 'DISMISSED';

  @CreateDateColumn()
  createdAt: Date;
}
