import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';

export class AiSearchDto {
  query: string;
}

export class AiGenerateListingDto {
  notes: string;
}

@ApiTags('AI Engine (Tabiiy Til Qidiruvi va Yordamchi)')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('search')
  @ApiOperation({ summary: 'Tabiiy tilda (O\'zbekcha/Ruscha) yozilgan so\'rov orqali aqlli qidiruv' })
  @ApiResponse({ status: 200, description: 'Tahlil qilingan parametrlar va bazadan topilgan mos e\'lonlar' })
  async searchWithAi(@Body() dto: AiSearchDto) {
    return this.aiService.processSearchQuery(dto.query || '');
  }

  @Post('generate-listing')
  @ApiOperation({ summary: 'Mulk egasi uchun qisqa izohdan professional e\'lon matnini yaratish' })
  async generateListing(@Body() dto: AiGenerateListingDto) {
    return this.aiService.generateListingContent(dto.notes || '');
  }
}
