import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Ip
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FraudProtectionService } from './fraud-protection.service';
import {
  CreateReportDto,
  ReviewRiskAssessmentDto,
  FraudQueueQueryDto
} from './fraud-protection.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { UserRole } from '@uytop/shared-types';

@ApiTags('Fraud & Trust (Firibgarlikdan Himoya va Ishonchlilik)')
@Controller()
export class FraudProtectionController {
  constructor(private readonly fraudService: FraudProtectionService) {}

  @Post('properties/:id/report')
  @ApiOperation({ summary: 'Mulk e\'loni ustidan shikoyat qilish (Spam / Fake / Narx xatosi)' })
  async reportProperty(
    @Param('id') id: string,
    @Body() dto: CreateReportDto,
    @Ip() ip: string
  ) {
    return this.fraudService.reportProperty(id, dto, ip);
  }

  @Get('properties/:id/trust')
  @ApiOperation({ summary: 'Mulkning ochiq ishonchlilik ma\'lumotlari va tasdiq darajasi' })
  async getTrustDetails(@Param('id') id: string) {
    return this.fraudService.getTrustDetails(id);
  }

  @Get('admin/fraud/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderatorlar uchun xavfli va shubhali e\'lonlar navbati' })
  async getFraudQueue(@Query() query: FraudQueueQueryDto) {
    return this.fraudService.getFraudQueue(query);
  }

  @Post('admin/fraud/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shubhali e\'lonni tekshirish va qaror qabul qilish (Audit jurnali bilan)' })
  async reviewAssessment(
    @Param('id') id: string,
    @Body() dto: ReviewRiskAssessmentDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.fraudService.reviewRiskAssessment(id, dto, user.id);
  }

  @Post('admin/properties/:id/assess')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mulk xavf darajasini majburiy qayta hisoblash' })
  async triggerAssessment(@Param('id') id: string) {
    return this.fraudService.assessProperty(id);
  }
}
