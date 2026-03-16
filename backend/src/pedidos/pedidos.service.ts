import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Etapa, EstadoItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

const INCLUDE_FULL = {
  cliente: { select: { id: true, razonSocial: true, nit: true } },
  factura: { select: { id: true, numero: true } },
  items: {
    include: {
      producto: { select: { id: true, nombre: true, codigo: true } },
      etapas: { orderBy: { etapa: 'asc' as const } },
    },
  },
};

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, estado?: string, sort?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
        { responsable: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = sort === 'asc' ? { fecha: 'asc' as const } : { fecha: 'desc' as const };
    return this.prisma.pedido.findMany({
      where,
      include: {
        cliente: { select: { id: true, razonSocial: true } },
        factura: { select: { id: true, numero: true } },
        items: { include: { etapas: true } },
      },
      orderBy,
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id }, include: INCLUDE_FULL });
    if (!pedido) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return pedido;
  }

  async create(dto: CreatePedidoDto) {
    const { items, fecha, fechaEntregaEstimada, ...rest } = dto;

    return this.prisma.pedido.create({
      data: {
        ...rest,
        fecha: fecha ? new Date(fecha) : undefined,
        fechaEntregaEstimada: fechaEntregaEstimada ? new Date(fechaEntregaEstimada) : undefined,
        items: items
          ? {
              create: items.map((item) => ({
                ...item,
                etapas: {
                  create: [
                    { etapa: Etapa.corte },
                    { etapa: Etapa.templado },
                    { etapa: Etapa.despacho },
                  ],
                },
              })),
            }
          : undefined,
      },
      include: INCLUDE_FULL,
    });
  }

  async update(id: string, dto: UpdatePedidoDto) {
    await this.findOne(id);
    const { items, fechaEntregaEstimada, ...rest } = dto;

    if (items !== undefined) {
      await this.prisma.pedidoItem.deleteMany({ where: { pedidoId: id } });
    }

    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...rest,
        fechaEntregaEstimada: fechaEntregaEstimada ? new Date(fechaEntregaEstimada) : undefined,
        items: items
          ? {
              create: items.map((item) => ({
                ...item,
                etapas: {
                  create: [
                    { etapa: Etapa.corte },
                    { etapa: Etapa.templado },
                    { etapa: Etapa.despacho },
                  ],
                },
              })),
            }
          : undefined,
      },
      include: INCLUDE_FULL,
    });
  }

  async updateEtapa(pedidoId: string, itemId: string, etapaKey: string, completado: boolean) {
    await this.findOne(pedidoId);

    const etapa = etapaKey as Etapa;
    if (!Object.values(Etapa).includes(etapa)) {
      throw new BadRequestException(`Etapa "${etapaKey}" no válida. Use: corte, templado, despacho`);
    }

    const etapaRecord = await this.prisma.pedidoItemEtapa.findUnique({
      where: { pedidoItemId_etapa: { pedidoItemId: itemId, etapa } },
    });

    if (!etapaRecord) throw new NotFoundException(`Etapa ${etapaKey} no encontrada en item ${itemId}`);

    const updated = await this.prisma.pedidoItemEtapa.update({
      where: { pedidoItemId_etapa: { pedidoItemId: itemId, etapa } },
      data: {
        completado,
        fechaFin: completado ? new Date() : null,
      },
    });

    // Actualizar estado del item según etapas
    const etapas = await this.prisma.pedidoItemEtapa.findMany({ where: { pedidoItemId: itemId } });
    const todasCompletas = etapas.every((e) => e.completado);
    const algunaEnProceso = etapas.some((e) => e.completado);

    let estadoItem: EstadoItem = 'pendiente';
    if (todasCompletas) estadoItem = 'completado';
    else if (algunaEnProceso) estadoItem = 'en_proceso';

    await this.prisma.pedidoItem.update({
      where: { id: itemId },
      data: { estadoItem },
    });

    // Actualizar estado del pedido
    const allItems = await this.prisma.pedidoItem.findMany({ where: { pedidoId } });
    const todoCompletado = allItems.every((i) => i.estadoItem === 'completado');
    const algunoEnProceso = allItems.some((i) => i.estadoItem !== 'pendiente');

    let estadoPedido = 'pendiente';
    if (todoCompletado) estadoPedido = 'completado';
    else if (algunoEnProceso) estadoPedido = 'en_proceso';

    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado: estadoPedido as any },
    });

    return updated;
  }
}
