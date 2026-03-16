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
import { EstadoPedido } from '@prisma/client';
import { PedidoItemDto } from './create-pedido.dto';

export class UpdatePedidoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaEntregaEstimada?: string;

  @ApiPropertyOptional({ enum: EstadoPedido })
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
