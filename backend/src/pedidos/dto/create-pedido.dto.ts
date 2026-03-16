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
import { EstadoPedido, EstadoItem } from '@prisma/client';

export class PedidoItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productoId?: string;

  @ApiProperty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @ApiPropertyOptional({ default: 'm2' })
  @IsOptional()
  @IsString()
  unidad?: string;

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

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;

  @ApiPropertyOptional({ default: 19 })
  @IsOptional()
  @IsInt()
  iva?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notasTecnicas?: string;
}

export class CreatePedidoDto {
  @ApiProperty({ example: 'PF-2025-002' })
  @IsString()
  id: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  numero: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaEntregaEstimada?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facturaId?: string;

  @ApiProperty({ example: 'C001' })
  @IsString()
  clienteId: string;

  @ApiPropertyOptional({ enum: EstadoPedido, default: EstadoPedido.pendiente })
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsable?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacionesProduccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  procesos?: any;

  @ApiPropertyOptional({ type: [PedidoItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items?: PedidoItemDto[];
}
