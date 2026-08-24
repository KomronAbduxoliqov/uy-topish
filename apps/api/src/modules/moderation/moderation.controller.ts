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
import { IsNotEmpty, IsString, MaxLength, IsEnum } from 'class-validator';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { UserRole, VerificationTier } from '@uytop/shared-types';

export class RejectDto {
  @IsNotEmpty({ message: 'Rad etish sababi kiritilishi shart' })
  @IsString()
  @MaxLength(500, { message: 'Rad etish sababi 500 belgidan oshmasligi kerak' })
  reason: string;
}

export class VerifyTierDto {
  @IsNotEmpty({ message: 'Ishonchlilik darajasi (tier) tanlanishi shart' })
  @IsEnum(VerificationTier, { message: 'Noto‘g‘ri ishonchlilik darajasi' })
  tier: VerificationTier;
}

@ApiTags('Moderation (Moderatsiya va Tasdiqlash)')
@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Moderatsiyani kutayotgan e\'lonlar navbati' })
  async getQueue() {
    return this.moderationService.getPendingQueue();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'E\'lonni tasdiqlash va chop etish' })
  async approve(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: UserEntity
  ) {
    return this.moderationService.approveListing(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'E\'lonni rad etish va sababini ko\'rsatish' })
  async reject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RejectDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.moderationService.rejectListing(id, user.id, dto.reason);
  }

  @Post(':id/verify-tier')
  @ApiOperation({ summary: 'E\'lonning ishonchlilik darajasini yangilash' })
  async setTier(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: VerifyTierDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.moderationService.setVerificationTier(id, user.id, dto.tier);
  }

  @Get(':id/duplicates')
  @ApiOperation({ summary: 'Dublikat va firibgarlik ehtimolini tekshirish' })
  async checkDuplicates(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.moderationService.analyzeDuplicates(id);
  }
}
