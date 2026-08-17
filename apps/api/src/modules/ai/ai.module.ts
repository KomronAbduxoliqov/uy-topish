import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { SearchModule } from '../search/search.module';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [SearchModule, GeoModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
