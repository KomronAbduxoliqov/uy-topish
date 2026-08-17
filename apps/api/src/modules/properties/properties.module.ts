import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../../database/entities/property.entity';
import { PropertyImageEntity } from '../../database/entities/property-image.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyImageEntity]),
    GeoModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
