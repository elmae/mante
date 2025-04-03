import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsArray,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { Point } from "geojson";

export class TechnicalSpecsDto {
  @IsString()
  @IsNotEmpty()
  cpu!: string;

  @IsString()
  @IsNotEmpty()
  memory!: string;

  @IsString()
  @IsNotEmpty()
  os!: string;

  @IsNumber()
  @IsNotEmpty()
  cash_capacity!: number;

  @IsArray()
  @IsString({ each: true })
  supported_transactions!: string[];

  // Permitir propiedades adicionales
  [key: string]: any;
}

export class LocationDto implements Point {
  @IsString()
  @IsNotEmpty()
  type: "Point" = "Point";

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates!: number[];
}

export class CreateAtmDto {
  @IsString()
  @IsNotEmpty()
  serial_number!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @ValidateNested()
  @Type(() => TechnicalSpecsDto)
  @IsObject()
  technical_specs!: TechnicalSpecsDto;

  @IsUUID()
  @IsNotEmpty()
  client_id!: string;

  @IsUUID()
  @IsNotEmpty()
  zone_id!: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
