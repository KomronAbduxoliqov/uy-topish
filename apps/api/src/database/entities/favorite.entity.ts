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
import { UserEntity } from './user.entity';

@Entity('favorites')
@Index(['userId', 'propertyId'], { unique: true })
export class FavoriteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  propertyId: string;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @CreateDateColumn()
  createdAt: Date;
}
