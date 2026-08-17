import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GeoService } from './geo.service';

@ApiTags('Geo (Geolokatsiya va Hududlar)')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

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
}
