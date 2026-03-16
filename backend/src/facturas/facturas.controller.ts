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
import { FacturasService } from './facturas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@ApiTags('Facturas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar facturas' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'estadoDian', required: false, enum: ['pendiente', 'aceptada', 'error'] })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('search') search?: string,
    @Query('estadoDian') estadoDian?: string,
    @Query('sort') sort?: string,
  ) {
    return this.facturasService.findAll(search, estadoDian, sort);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener factura por ID con items' })
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear factura' })
  create(@Body() dto: CreateFacturaDto) {
    return this.facturasService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar factura (estadoDian, cufe, items)' })
  update(@Param('id') id: string, @Body() dto: UpdateFacturaDto) {
    return this.facturasService.update(id, dto);
  }
}
