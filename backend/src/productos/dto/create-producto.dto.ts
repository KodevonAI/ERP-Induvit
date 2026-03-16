import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductoDto {
  @ApiPropertyOptional({ example: 'P016' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'VT-12' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Vidrio Templado 12mm' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  espesor?: string;

  @ApiPropertyOptional({ default: 'm2' })
  @IsOptional()
  @IsString()
  unidad?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioM2?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPieza?: number;

  @ApiPropertyOptional({ default: 19 })
  @IsOptional()
  @IsInt()
  iva?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
