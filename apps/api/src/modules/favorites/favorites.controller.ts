import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';

export class CompareDto {
  @IsArray({ message: 'Taqqoslash uchun e\'lonlar ID ro‘yxati massiv bo‘lishi kerak' })
  @IsUUID('4', { each: true, message: 'Har bir taqqoslash ID si to‘g‘ri UUID bo‘lishi kerak' })
  propertyIds: string[];
}

@ApiTags('Favorites & Compare (Saqlanganlar va Taqqoslash)')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':propertyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'E\'lonni saqlanganlarga qo\'shish yoki olib tashlash (Toggle)' })
  async toggleFavorite(
    @Param('propertyId', new ParseUUIDPipe({ version: '4' })) propertyId: string,
    @CurrentUser() user: UserEntity
  ) {
    return this.favoritesService.toggleFavorite(user.id, propertyId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchining barcha saqlangan e\'lonlarini olish' })
  async getFavorites(@CurrentUser() user: UserEntity) {
    return this.favoritesService.getUserFavorites(user.id);
  }

  @Post('compare/matrix')
  @ApiOperation({ summary: 'Tanlangan e\'lonlarni bir-biri bilan taqqoslash' })
  async compareProperties(@Body() dto: CompareDto) {
    return this.favoritesService.compareProperties(dto.propertyIds || []);
  }
}
