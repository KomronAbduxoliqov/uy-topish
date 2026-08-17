import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';

export class CompareDto {
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
    @Param('propertyId') propertyId: string,
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
