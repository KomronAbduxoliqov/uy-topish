import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { PropertyEntity } from './property.entity';
import { UserEntity } from './user.entity';

@Entity('moderation_logs')
export class ModerationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: string;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @Column()
  moderatorId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'moderatorId' })
  moderator: UserEntity;

  @Column()
  action: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'VERIFIED' | 'UNVERIFIED';

  @Column({ nullable: true })
  reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
