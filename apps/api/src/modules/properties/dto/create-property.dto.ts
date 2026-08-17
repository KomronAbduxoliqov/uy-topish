import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  Min,
  Max
} from 'class-validator';
import {
  TransactionType,
  PropertyType,
  RenovationType,
  BuildingType,
  ListingStatus
} from '@uytop/shared-types';

export class PropertyImageDto {
  @IsNotEmpty()
  @IsString()
  originalUrl: string;

  @IsNotEmpty()
  @IsString()
  webpUrl: string;

  @IsNotEmpty()
  @IsString()
  thumbnailUrl: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

export class CreatePropertyDto {
  @IsNotEmpty({ message: "Sarlavha kiritilishi shart" })
  @IsString()
  titleUz: string;

  @IsOptional()
  @IsString()
  titleRu?: string;

  @IsNotEmpty({ message: "Batafsil tavsif kiritilishi shart" })
  @IsString()
  descriptionUz: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @IsNotEmpty({ message: "Bitim turi tanlanishi shart (Ijara/Sotuv)" })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsNotEmpty({ message: "Mulk turi tanlanishi shart (Kvartira/Uy...)" })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsNotEmpty({ message: "Narx (UZS) kiritilishi shart" })
  @IsNumber()
  @Min(1000, { message: "Narx minimal 1000 so'm bo'lishi kerak" })
  priceUzs: number;

  @IsOptional()
  @IsNumber()
  priceUsd?: number;

  @IsNotEmpty({ message: "Xonalar soni kiritilishi shart" })
  @IsNumber()
  @Min(1)
  @Max(20)
  rooms: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsNotEmpty({ message: "Umumiy maydon (m²) kiritilishi shart" })
  @IsNumber()
  @Min(10)
  areaSqm: number;

  @IsOptional()
  @IsNumber()
  livingAreaSqm?: number;

  @IsOptional()
  @IsNumber()
  landAreaSotix?: number;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @IsNotEmpty({ message: "Ta'mir holati tanlanishi shart" })
  @IsEnum(RenovationType)
  renovation: RenovationType;

  @IsNotEmpty()
  @IsBoolean()
  furnished: boolean;

  @IsOptional()
  @IsEnum(BuildingType)
  buildingType?: BuildingType;

  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @IsNotEmpty({ message: "Aniq manzil kiritilishi shart" })
  @IsString()
  addressLine: string;

  @IsNotEmpty({ message: "Shahar nomi kiritilishi shart" })
  @IsString()
  city: string;

  @IsNotEmpty({ message: "Tuman nomi kiritilishi shart" })
  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  mahalla?: string;

  @IsNotEmpty({ message: "Xaritadagi kenglik (latitude) tanlanishi shart" })
  @IsNumber()
  latitude: number;

  @IsNotEmpty({ message: "Xaritadagi uzunlik (longitude) tanlanishi shart" })
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsObject()
  amenities?: Record<string, boolean>;

  @IsOptional()
  @IsArray()
  images?: PropertyImageDto[];

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;
}
