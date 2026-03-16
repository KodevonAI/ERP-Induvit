import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CotizacionesService } from './cotizaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';

@ApiTags('Cotizaciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cotizaciones' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: ['borrador', 'enviada', 'aprobada', 'rechazada'] })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('sort') sort?: string,
  ) {
    return this.cotizacionesService.findAll(search, estado, sort);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cotización por ID con items' })
  findOne(@Param('id') id: string) {
    return this.cotizacionesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear cotización con items' })
  create(@Body() dto: CreateCotizacionDto) {
    return this.cotizacionesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cotización (incluye cambio de estado y items)' })
  update(@Param('id') id: string, @Body() dto: UpdateCotizacionDto) {
    return this.cotizacionesService.update(id, dto);
  }
}
