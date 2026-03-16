import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCotizacion } from '@prisma/client';
import { CotizacionItemDto } from './create-cotizacion.dto';

export class UpdateCotizacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vigencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendedor?: string;

  @ApiPropertyOptional({ enum: EstadoCotizacion })
  @IsOptional()
  @IsEnum(EstadoCotizacion)
  estado?: EstadoCotizacion;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  condicionesPago?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plazoEntrega?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  descuento?: number;

  @ApiPropertyOptional({ type: [CotizacionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotizacionItemDto)
  items?: CotizacionItemDto[];
}
