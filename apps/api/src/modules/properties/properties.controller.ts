import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { SmartNearbyService } from '../geo/smart-nearby.service';

@ApiTags('Properties (Ko\'chmas Mulk E\'lonlari)')
@Controller('properties')
export class PropertiesController {
  private readonly logger = new Logger(PropertiesController.name);

  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly smartNearbyService: SmartNearbyService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi ko\'chmas mulk e\'loni joylashtirish (Wizard)' })
  @ApiResponse({ status: 201, description: 'E\'lon muvaffaqiyatli yaratildi' })
  async create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.propertiesService.create(dto, user.id, user.phone, user.fullName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'E\'lon tafsilotlarini ID bo\'yicha olish' })
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.propertiesService.incrementViews(id).catch((err) => {
      this.logger.warn(`Could not increment views for property ${id}: ${err.message}`);
    });
    return this.propertiesService.findById(id);
  }

  @Get(':id/nearby-context')
  @ApiOperation({ summary: 'Mulk atrofidagi Smart Nearby ob\'ektlar va qulaylik indeksi' })
  async getNearbyContext(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const prop = await this.propertiesService.findById(id);
    return this.smartNearbyService.getNearbyContext(Number(prop.latitude), Number(prop.longitude));
  }

  @Post(':id/contact-click')
  @ApiOperation({ summary: 'Telefon raqam ko\'rish / Telegram tugmasi bosilganini qayd etish' })
  async recordContactClick(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.propertiesService.incrementContactClicks(id);
    return { success: true };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'E\'lonni tahrirlash' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.propertiesService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'E\'lonni o\'chirish' })
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: UserEntity
  ) {
    return this.propertiesService.delete(id, user.id, user.role);
  }
}
