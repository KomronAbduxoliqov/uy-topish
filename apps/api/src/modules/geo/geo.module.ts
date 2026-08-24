import { Module } from '@nestjs/common';
import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';
import { RoutingService } from './routing.service';
import { SmartNearbyService } from './smart-nearby.service';

@Module({
  controllers: [GeoController],
  providers: [GeoService, RoutingService, SmartNearbyService],
  exports: [GeoService, RoutingService, SmartNearbyService],
})
export class GeoModule {}
