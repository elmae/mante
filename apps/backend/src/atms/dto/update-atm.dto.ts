import { PartialType } from '@nestjs/mapped-types';
import { CreateAtmDto } from './create-atm.dto';

export class UpdateAtmDto extends PartialType(CreateAtmDto) {}
