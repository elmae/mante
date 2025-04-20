import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GeoPoint {
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;
}

class Location {
  @ValidateNested()
  @Type(() => GeoPoint)
  coordinates: GeoPoint;

  readonly type = 'Point' as const;
}

export class CreateAtmDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @ValidateNested()
  @Type(() => Location)
  location: Location;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  specifications?: Record<string, any>;
}
