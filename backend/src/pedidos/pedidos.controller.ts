import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@ApiTags('Pedidos de Fabricación')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pedidos de fabricación' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: ['pendiente', 'en_proceso', 'completado'] })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('sort') sort?: string,
  ) {
    return this.pedidosService.findAll(search, estado, sort);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID con items y etapas Kanban' })
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear pedido de fabricación' })
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar pedido' })
  update(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.pedidosService.update(id, dto);
  }

  @Patch(':id/items/:itemId/etapa/:etapaKey')
  @ApiOperation({ summary: 'Actualizar etapa Kanban de un item (corte/templado/despacho)' })
  updateEtapa(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Param('etapaKey') etapaKey: string,
    @Body('completado') completado: boolean,
  ) {
    return this.pedidosService.updateEtapa(id, itemId, etapaKey, completado);
  }
}
