import { IsNotEmpty, IsString, Matches, MinLength, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: "Telefon raqami kiritilishi shart" })
  @Matches(/^\+?998[0-9]{9}$/, {
    message: "Telefon raqami noto'g'ri formatda (masalan: +998901234567)"
  })
  phone: string;

  @IsNotEmpty({ message: "To'liq ism kiritilishi shart" })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsNotEmpty({ message: "Parol kiritilishi shart" })
  @MinLength(12, { message: "Parol kamida 12 ta belgidan iborat bo'lishi kerak" })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "Parolda katta-kichik harf va kamida bitta raqam bo'lishi kerak",
  })
  password: string;

  @IsOptional()
  @IsEmail({}, { message: "Email manzili noto'g'ri" })
  email?: string;


  @IsOptional()
  @IsString()
  @MaxLength(150)
  agencyName?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: "Telefon raqami kiritilishi shart" })
  @Matches(/^\+?998[0-9]{9}$/, {
    message: "Telefon raqami noto'g'ri formatda (masalan: +998901234567)"
  })
  phone: string;

  @IsNotEmpty({ message: "Parol kiritilishi shart" })
  @MaxLength(128)
  password: string;
}
