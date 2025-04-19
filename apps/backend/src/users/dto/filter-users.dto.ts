import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  readonly limit?: number = 10;

  @IsOptional()
  @IsString()
  readonly role?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  @IsString()
  readonly search?: string;
}
