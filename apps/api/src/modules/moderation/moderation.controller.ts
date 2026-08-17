import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { UserRole, VerificationTier } from '@uytop/shared-types';

export class RejectDto {
  reason: string;
}

export class VerifyTierDto {
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
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ) {
    return this.moderationService.approveListing(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'E\'lonni rad etish va sababini ko\'rsatish' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.moderationService.rejectListing(id, user.id, dto.reason);
  }

  @Post(':id/verify-tier')
  @ApiOperation({ summary: 'E\'lonning ishonchlilik darajasini yangilash' })
  async setTier(
    @Param('id') id: string,
    @Body() dto: VerifyTierDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.moderationService.setVerificationTier(id, user.id, dto.tier);
  }

  @Get(':id/duplicates')
  @ApiOperation({ summary: 'Dublikat va firibgarlik ehtimolini tekshirish' })
  async checkDuplicates(@Param('id') id: string) {
    return this.moderationService.analyzeDuplicates(id);
  }
}
