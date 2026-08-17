import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';

@ApiTags('Auth (Autentifikatsiya)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yangi foydalanuvchi yoki mulk egasi/agentni ro\'yxatdan o\'tkazish' })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli ro\'yxatdan o\'tildi' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Telefon raqam va parol orqali tizimga kirish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirildi va JWT token berildi' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy tizimga kirgan foydalanuvchi profilini olish' })
  async getProfile(@CurrentUser() user: UserEntity) {
    return this.authService.getMe(user.id);
  }
}
