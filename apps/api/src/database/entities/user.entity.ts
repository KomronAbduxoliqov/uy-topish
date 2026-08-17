import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { UserRole, UserVerificationStatus } from '@uytop/shared-types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserVerificationStatus,
    default: UserVerificationStatus.UNVERIFIED
  })
  verificationStatus: UserVerificationStatus;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  agencyName?: string;

  @Column({ nullable: true })
  agentLicenseNo?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
