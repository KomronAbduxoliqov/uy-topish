import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';

@ApiTags('Properties (Ko\'chmas Mulk E\'lonlari)')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

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
  async getById(@Param('id') id: string) {
    // Increment view count in background
    this.propertiesService.incrementViews(id);
    return this.propertiesService.findById(id);
  }

  @Post(':id/contact-click')
  @ApiOperation({ summary: 'Telefon raqam ko\'rish / Telegram tugmasi bosilganini qayd etish' })
  async recordContactClick(@Param('id') id: string) {
    await this.propertiesService.incrementContactClicks(id);
    return { success: true };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'E\'lonni tahrirlash' })
  async update(
    @Param('id') id: string,
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
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ) {
    return this.propertiesService.delete(id, user.id, user.role);
  }
}
