import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../database/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole, UserVerificationStatus } from '@uytop/shared-types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  private normalizePhone(phone: string): string {
    let clean = phone.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+')) {
      if (clean.startsWith('998')) {
        clean = '+' + clean;
      }
    }
    return clean;
  }

  async register(dto: RegisterDto) {
    const phone = this.normalizePhone(dto.phone);
    const existing = await this.userRepository.findOne({ where: { phone } });
    if (existing) {
      throw new ConflictException("Ushbu telefon raqamiga tegishli hisob allaqachon mavjud");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      phone,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: dto.role || UserRole.USER,
      verificationStatus: UserVerificationStatus.PHONE_VERIFIED, // verified on SMS code validation flow
      agencyName: dto.agencyName,
      isActive: true
    });

    const saved = await this.userRepository.save(user);
    const tokens = this.generateTokens(saved);

    return {
      user: this.sanitizeUser(saved),
      ...tokens
    };
  }

  async login(dto: LoginDto) {
    const phone = this.normalizePhone(dto.phone);
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Telefon raqami yoki parol noto'g'ri");
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("Telefon raqami yoki parol noto'g'ri");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Hisobingiz ma'muriyat tomonidan vaqtincha to'xtatilgan");
    }

    const tokens = this.generateTokens(user);
    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }
    return this.sanitizeUser(user);
  }

  private generateTokens(user: UserEntity) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d'
    });

    return {
      accessToken
    };
  }

  private sanitizeUser(user: UserEntity) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
