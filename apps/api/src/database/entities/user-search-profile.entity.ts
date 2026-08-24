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
import { UserEntity } from './user.entity';
import { UserPreferenceModel } from '@uytop/shared-types';

@Entity('user_search_profiles')
export class UserSearchProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'jsonb' })
  preferences: UserPreferenceModel;

  @Column({ name: 'is_active_alert', type: 'boolean', default: true })
  isActiveAlert: boolean;

  @Column({ name: 'last_matches_count', type: 'int', default: 0 })
  lastMatchesCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
