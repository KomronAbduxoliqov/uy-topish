import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AiHomeFinderService } from './ai-home-finder.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import {
  ChatRequestDto,
  ChatResponseDto,
  RefineRequestDto,
  FeedbackRequestDto,
  SaveProfileDto
} from './ai-home-finder.types';

@Controller('ai-home-finder')
export class AiHomeFinderController {
  constructor(private readonly finderService: AiHomeFinderService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatRequestDto, @Req() req: any): Promise<ChatResponseDto> {
    const userId = req.user?.id;
    return this.finderService.processConversation(dto, userId);
  }

  @Post('refine')
  @HttpCode(HttpStatus.OK)
  async refine(@Body() dto: RefineRequestDto): Promise<ChatResponseDto> {
    return this.finderService.refineSearch(dto);
  }

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  async feedback(@Body() dto: FeedbackRequestDto) {
    return this.finderService.processFeedback(dto);
  }

  @Post('profiles')
  @UseGuards(JwtAuthGuard)
  async saveProfile(@Body() dto: SaveProfileDto, @CurrentUser() user: UserEntity) {
    return this.finderService.saveProfile(dto, user.id);
  }

  @Get('profiles')
  @UseGuards(JwtAuthGuard)
  async getProfiles(@CurrentUser() user: UserEntity) {
    return this.finderService.getProfiles(user.id);
  }

  @Delete('profiles/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.finderService.deleteProfile(id, user.id);
  }
}
