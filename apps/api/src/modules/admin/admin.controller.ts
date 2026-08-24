import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@uytop/shared-types';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'Foydalanuvchi roli kiritilishi shart' })
  @IsEnum(UserRole, { message: 'Noto‘g‘ri foydalanuvchi roli' })
  role: UserRole;
}

@ApiTags('Admin Panel (Ma\'muriyat Boshqaruvi)')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Platforma asosiy metrikalari va analitikasi' })
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Barcha foydalanuvchilar ro\'yxati' })
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Foydalanuvchi rolini o\'zgartirish' })
  async updateRole(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRoleDto
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }
}
