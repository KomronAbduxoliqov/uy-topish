import { IsNotEmpty, IsString, Matches, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { UserRole } from '@uytop/shared-types';

export class RegisterDto {
  @IsNotEmpty({ message: "Telefon raqami kiritilishi shart" })
  @Matches(/^\+?998[0-9]{9}$/, {
    message: "Telefon raqami noto'g'ri formatda (masalan: +998901234567)"
  })
  phone: string;

  @IsNotEmpty({ message: "To'liq ism kiritilishi shart" })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: "Parol kiritilishi shart" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;

  @IsOptional()
  @IsEmail({}, { message: "Email manzili noto'g'ri" })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Foydalanuvchi roli noto'g'ri" })
  role?: UserRole;

  @IsOptional()
  @IsString()
  agencyName?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: "Telefon raqami kiritilishi shart" })
  @Matches(/^\+?998[0-9]{9}$/, {
    message: "Telefon raqami noto'g'ri formatda (masalan: +998901234567)"
  })
  phone: string;

  @IsNotEmpty({ message: "Parol kiritilishi shart" })
  password: string;
}
