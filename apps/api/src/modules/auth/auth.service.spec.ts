import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserEntity } from '../../database/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserVerificationStatus } from '@uytop/shared-types';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ id: 'usr-123', ...dto })),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_access_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user with hashed password and return sanitized profile + token', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    const dto = {
      phone: '+998901234567',
      fullName: 'Rustam Karimov',
      password: 'StrongPassword123!',
      role: UserRole.OWNER,
    };

    const result = await service.register(dto);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { phone: '+998901234567' },
    });
    expect(result.user.phone).toBe('+998901234567');
    expect(result.user.fullName).toBe('Rustam Karimov');
    // Public registration must never honor a caller-supplied privileged role.
    expect(result.user.role).toBe(UserRole.USER);
    expect((result.user as any).passwordHash).toBeUndefined();
    expect(result.accessToken).toBe('mock_jwt_access_token');
  });

  it('should throw ConflictException if phone number is already registered', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

    const dto = {
      phone: '+998901234567',
      fullName: 'Rustam Karimov',
      password: 'StrongPassword123!',
    };

    await expect(service.register(dto)).rejects.toThrow(ConflictException);
  });

  it('should authenticate user with valid credentials and return JWT token', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword123', 10);
    const existingUser = {
      id: 'usr-1',
      phone: '+998901234567',
      fullName: 'Rustam Karimov',
      passwordHash,
      role: UserRole.USER,
      isActive: true,
    };

    mockUserRepository.findOne.mockResolvedValue(existingUser);

    const result = await service.login({
      phone: '+998 90 123 45 67',
      password: 'CorrectPassword123',
    });

    expect(result.accessToken).toBe('mock_jwt_access_token');
    expect(result.user.phone).toBe('+998901234567');
  });

  it('should reject login with wrong password', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword123', 10);
    mockUserRepository.findOne.mockResolvedValue({
      id: 'usr-1',
      phone: '+998901234567',
      passwordHash,
      isActive: true,
    });

    await expect(
      service.login({
        phone: '+998901234567',
        password: 'WrongPassword',
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login for inactive / banned accounts', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword123', 10);
    mockUserRepository.findOne.mockResolvedValue({
      id: 'usr-1',
      phone: '+998901234567',
      passwordHash,
      isActive: false, // Banned
    });

    await expect(
      service.login({
        phone: '+998901234567',
        password: 'CorrectPassword123',
      })
    ).rejects.toThrow(UnauthorizedException);
  });
});
