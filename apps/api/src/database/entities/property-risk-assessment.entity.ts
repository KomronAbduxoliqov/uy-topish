import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { PropertyEntity } from './property.entity';
import { RiskLevel, FraudSignal } from '@uytop/shared-types';

@Entity('property_risk_assessments')
export class PropertyRiskAssessmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  propertyId: string;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @Column({ type: 'int', default: 0 })
  riskScore: number; // 0-100

  @Column({
    type: 'varchar',
    length: 20,
    default: 'LOW'
  })
  riskLevel: RiskLevel; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ type: 'jsonb', default: [] })
  signals: FraudSignal[];

  @Column({ type: 'text', nullable: true })
  aiExplanation?: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'AUTO_APPROVED'
  })
  status: 'AUTO_APPROVED' | 'PENDING_REVIEW' | 'FLAGGED' | 'RESOLVED';

  @Column({ nullable: true })
  duplicateOfPropertyId?: string;

  @Column({ nullable: true })
  reviewedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reviewedAt?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
