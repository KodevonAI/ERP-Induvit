import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DianService } from './dian.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('DIAN')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dian')
export class DianController {
  constructor(private readonly dianService: DianService) {}

  @Post('enviar')
  @ApiOperation({ summary: 'Enviar factura a DIAN (ambiente habilitación)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { facturaId: { type: 'string', example: 'FAC-2025-001' } },
      required: ['facturaId'],
    },
  })
  enviarFactura(@Body('facturaId') facturaId: string) {
    return this.dianService.enviarFactura(facturaId);
  }
}
