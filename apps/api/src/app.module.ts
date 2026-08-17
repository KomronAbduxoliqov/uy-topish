import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './database/entities/user.entity';
import { PropertyEntity } from './database/entities/property.entity';
import { PropertyImageEntity } from './database/entities/property-image.entity';
import { FavoriteEntity } from './database/entities/favorite.entity';
import { ModerationLogEntity } from './database/entities/moderation-log.entity';

import { AuthModule } from './modules/auth/auth.module';
import { GeoModule } from './modules/geo/geo.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { SearchModule } from './modules/search/search.module';
import { AiModule } from './modules/ai/ai.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const dbUrl = config.get<string>('DATABASE_URL');

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [UserEntity, PropertyEntity, PropertyImageEntity, FavoriteEntity, ModerationLogEntity],
            synchronize: true, // For development/MVP auto-sync
            ssl: isProd ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_NAME', 'uytop_db'),
          entities: [UserEntity, PropertyEntity, PropertyImageEntity, FavoriteEntity, ModerationLogEntity],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    GeoModule,
    PropertiesModule,
    SearchModule,
    AiModule,
    FavoritesModule,
    ModerationModule,
    AdminModule,
  ],
})
export class AppModule {}
