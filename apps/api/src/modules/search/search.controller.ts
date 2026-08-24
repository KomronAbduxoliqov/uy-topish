import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { PropertySearchFilters } from '@uytop/shared-types';

@ApiTags('Search (Qidiruv, Piyoda Vaqt va Filtrlash)')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Mulk qidirish (Spatial radius, piyoda vaqt, filtrlash va saralash)' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'transactionType', required: false, enum: ['RENT', 'SALE', 'DAILY'] })
  @ApiQuery({ name: 'propertyType', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'centerLat', required: false, type: Number })
  @ApiQuery({ name: 'centerLng', required: false, type: Number })
  @ApiQuery({ name: 'radiusMeters', required: false, type: Number })
  @ApiQuery({ name: 'travelMinutes', required: false, type: Number })
  @ApiQuery({ name: 'searchMode', required: false, enum: ['RADIUS', 'WALKING_TIME', 'TRAVEL_DISTANCE'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query() filters: PropertySearchFilters) {
    return this.searchService.searchProperties(filters);
  }

  @Post('travel-time')
  @ApiOperation({ summary: 'Piyoda vaqt bo\'yicha mulklarni qidirish (Accessibility search)' })
  @ApiBody({ type: Object })
  async searchTravelTime(@Body() body: PropertySearchFilters) {
    return this.searchService.searchProperties({
      ...body,
      searchMode: 'WALKING_TIME',
    });
  }
}
