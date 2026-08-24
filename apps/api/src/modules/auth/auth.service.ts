import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../database/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole, UserVerificationStatus } from '@uytop/shared-types';

interface FailedLoginAttempt {
  count: number;
  lockUntil?: number;
}

@Injectable()
export class AuthService {
  // Constant-time dummy bcrypt hash to protect against timing attacks on non-existent accounts
  private readonly DUMMY_HASH = '$2b$12$e8uqY2M0Vz3nFk9uG6mJSe7H1J9K0L1M2N3O4P5Q6R7S8T9U0V1W2';

  // In-memory failed login tracker per phone number
  // TODO: For multi-instance horizontal scaling, migrate to Redis:
  //   await redis.incr(`login_fail:${phone}`);
  //   await redis.expire(`login_fail:${phone}`, 900); // 15 min TTL
  private failedAttempts = new Map<string, FailedLoginAttempt>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredAttempts();
    }, 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private cleanupExpiredAttempts(): void {
    const now = Date.now();
    for (const [phone, attempt] of this.failedAttempts) {
      if (attempt.lockUntil && now > attempt.lockUntil + 60 * 60 * 1000) {
        this.failedAttempts.delete(phone);
      }
    }
  }

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

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      phone,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      // Privileged roles and phone verification can only be granted by trusted back-office flows.
      role: UserRole.USER,
      verificationStatus: UserVerificationStatus.UNVERIFIED,
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
    const now = Date.now();

    // 1. Check if account is temporarily locked due to repeated failed attempts
    const attemptInfo = this.failedAttempts.get(phone);
    if (attemptInfo && attemptInfo.lockUntil && now < attemptInfo.lockUntil) {
      const waitMinutes = Math.ceil((attemptInfo.lockUntil - now) / 60000);
      throw new HttpException(
        `Xavfsizlik choralari tufayli hisobingizga kirish vaqtincha to'xtatildi. Iltimos, ${waitMinutes} daqiqadan so'ng qayta urinib ko'ring.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const user = await this.userRepository.findOne({ where: { phone } });

    // Constant-time execution: always run bcrypt.compare even if user not found
    const targetHash = user?.passwordHash || this.DUMMY_HASH;
    const isMatch = await bcrypt.compare(dto.password, targetHash);

    if (!user || !isMatch) {
      // Record failed attempt
      const prevCount = attemptInfo?.count || 0;
      const newCount = prevCount + 1;

      if (newCount >= 5) {
        // Lock for 15 minutes
        this.failedAttempts.set(phone, {
          count: newCount,
          lockUntil: now + 15 * 60 * 1000,
        });
      } else {
        this.failedAttempts.set(phone, { count: newCount });
      }

      throw new UnauthorizedException("Telefon raqami yoki parol noto'g'ri");
    }

    // Reset failed attempts on success
    this.failedAttempts.delete(phone);

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
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    return {
      accessToken
    };
  }

  private sanitizeUser(user: UserEntity) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
