import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteEntity } from '../../database/entities/favorite.entity';
import { PropertyEntity } from '../../database/entities/property.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteEntity, PropertyEntity]),
    GeoModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
