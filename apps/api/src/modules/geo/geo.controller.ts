import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { RoutingService } from './routing.service';
import { SmartNearbyService } from './smart-nearby.service';

@ApiTags('Geo (Geolokatsiya, Marshrut va Hududlar)')
@Controller('geo')
export class GeoController {
  constructor(
    private readonly geoService: GeoService,
    private readonly routingService: RoutingService,
    private readonly smartNearbyService: SmartNearbyService
  ) {}

  @Get('districts')
  @ApiOperation({ summary: 'Toshkent shahri tumanlari ro\'yxati' })
  getDistricts() {
    return this.geoService.getDistricts();
  }

  @Get('metro-stations')
  @ApiOperation({ summary: 'Toshkent metro bekatlari ro\'yxati va koordinatalari' })
  getMetroStations() {
    return this.geoService.getMetroStations();
  }

  @Get('nearest-metro')
  @ApiOperation({ summary: 'Berilgan koordinataga eng yaqin metro bekatini topish' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  getNearestMetro(@Query('lat') lat: number, @Query('lng') lng: number) {
    return this.geoService.findNearestMetro(Number(lat), Number(lng));
  }

  @Get('travel-time')
  @ApiOperation({ summary: 'Ikki nuqta orasidagi piyoda vaqt va marshrut masofasi' })
  @ApiQuery({ name: 'originLat', type: Number, required: true })
  @ApiQuery({ name: 'originLng', type: Number, required: true })
  @ApiQuery({ name: 'destLat', type: Number, required: true })
  @ApiQuery({ name: 'destLng', type: Number, required: true })
  async getTravelTime(
    @Query('originLat') originLat: number,
    @Query('originLng') originLng: number,
    @Query('destLat') destLat: number,
    @Query('destLng') destLng: number
  ) {
    return this.routingService.getWalkingRoute(
      { lat: Number(originLat), lng: Number(originLng) },
      { lat: Number(destLat), lng: Number(destLng) }
    );
  }

  @Get('nearby-context')
  @ApiOperation({ summary: 'Koordinata atrofidagi POI ob\'ektlar va qulaylik indeksi' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  async getNearbyContext(
    @Query('lat') lat: number,
    @Query('lng') lng: number
  ) {
    return this.smartNearbyService.getNearbyContext(Number(lat), Number(lng));
  }
}
