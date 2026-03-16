import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCotizacion } from '@prisma/client';

export class CotizacionItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productoId?: string;

  @ApiProperty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ancho?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  alto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @ApiPropertyOptional({ default: 'm2' })
  @IsOptional()
  @IsString()
  unidad?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  descuento?: number;

  @ApiPropertyOptional({ default: 19 })
  @IsOptional()
  @IsInt()
  iva?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  orden?: number;
}

export class CreateCotizacionDto {
  @ApiPropertyOptional({ example: 'COT-2025-002' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vigencia?: string;

  @ApiProperty({ example: 'C001' })
  @IsString()
  clienteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendedor?: string;

  @ApiPropertyOptional({ enum: EstadoCotizacion, default: EstadoCotizacion.borrador })
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

  @ApiPropertyOptional({ default: 0 })
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
