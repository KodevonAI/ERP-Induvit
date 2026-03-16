import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoDian } from '@prisma/client';
import { FacturaItemDto } from './create-factura.dto';

export class UpdateFacturaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  condicionesPago?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ enum: EstadoDian })
  @IsOptional()
  @IsEnum(EstadoDian)
  estadoDian?: EstadoDian;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cufe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaAceptacionDian?: string;

  @ApiPropertyOptional({ type: [FacturaItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacturaItemDto)
  items?: FacturaItemDto[];
}
