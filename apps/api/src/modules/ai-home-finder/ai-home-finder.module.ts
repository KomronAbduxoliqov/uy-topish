import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSearchProfileEntity } from '../../database/entities/user-search-profile.entity';
import { PropertyEntity } from '../../database/entities/property.entity';
import { SearchModule } from '../search/search.module';
import { GeoModule } from '../geo/geo.module';
import { PropertiesModule } from '../properties/properties.module';
import { AiControlledTools } from './ai-home-finder.tools';
import { AiHomeFinderService } from './ai-home-finder.service';
import { AiHomeFinderController } from './ai-home-finder.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSearchProfileEntity, PropertyEntity]),
    SearchModule,
    GeoModule,
    PropertiesModule,
  ],
  controllers: [AiHomeFinderController],
  providers: [AiControlledTools, AiHomeFinderService],
  exports: [AiHomeFinderService, AiControlledTools],
})
export class AiHomeFinderModule {}
