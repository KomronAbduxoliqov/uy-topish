import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { ModerationLogEntity } from '../../database/entities/moderation-log.entity';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, ModerationLogEntity]),
    PropertiesModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
