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
import { EstadoDian } from '@prisma/client';

export class FacturaItemDto {
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

export class CreateFacturaDto {
  @ApiPropertyOptional({ example: 'FAC-2025-002' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  numero?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @ApiProperty({ example: 'C001' })
  @IsString()
  clienteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cotizacionId?: string;

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

  @ApiPropertyOptional({ type: [FacturaItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacturaItemDto)
  items?: FacturaItemDto[];
}
