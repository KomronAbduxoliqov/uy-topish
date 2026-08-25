import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './database/entities/user.entity';
import { PropertyEntity } from './database/entities/property.entity';
import { PropertyImageEntity } from './database/entities/property-image.entity';
import { FavoriteEntity } from './database/entities/favorite.entity';
import { ModerationLogEntity } from './database/entities/moderation-log.entity';
import { UserSearchProfileEntity } from './database/entities/user-search-profile.entity';
import { PropertyRiskAssessmentEntity } from './database/entities/property-risk-assessment.entity';
import { PropertyReportEntity } from './database/entities/property-report.entity';

import { AuthModule } from './modules/auth/auth.module';
import { GeoModule } from './modules/geo/geo.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { SearchModule } from './modules/search/search.module';
import { AiModule } from './modules/ai/ai.module';
import { AiHomeFinderModule } from './modules/ai-home-finder/ai-home-finder.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AdminModule } from './modules/admin/admin.module';
import { FraudProtectionModule } from './modules/fraud-protection/fraud-protection.module';
import { HealthModule } from './modules/health/health.module';

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
        const shouldSync = config.get<string>('DB_SYNCHRONIZE') === 'true' || !isProd;
        const sslRejectUnauthorized = config.get<string>('DB_SSL_REJECT_UNAUTHORIZED') === 'true';

        const baseOptions = {
          entities: [
            UserEntity,
            PropertyEntity,
            PropertyImageEntity,
            FavoriteEntity,
            ModerationLogEntity,
            UserSearchProfileEntity,
            PropertyRiskAssessmentEntity,
            PropertyReportEntity,
          ],
          synchronize: shouldSync,
          extra: {
            max: Number(config.get<number>('DB_POOL_MAX', 25)),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          },
        };

        if (dbUrl) {
          const isSsl = config.get<string>('DB_SSL') !== 'false';
          return {
            type: 'postgres',
            url: dbUrl,
            ...baseOptions,
            ssl: isSsl ? { rejectUnauthorized: sslRejectUnauthorized } : false,
          };
        }

        const isSslConfigured = config.get<string>('DB_SSL') === 'true';
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME', 'uytop_db'),
          ...baseOptions,
          ssl: isSslConfigured ? { rejectUnauthorized: sslRejectUnauthorized } : false,
        };
      },
    }),
    HealthModule,
    AuthModule,
    GeoModule,
    PropertiesModule,
    SearchModule,
    AiModule,
    AiHomeFinderModule,
    FavoritesModule,
    ModerationModule,
    FraudProtectionModule,
    AdminModule,
  ],
})
export class AppModule {}
