import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';

const INCLUDE_FULL = {
  cliente: { select: { id: true, razonSocial: true, nit: true } },
  items: {
    include: { producto: { select: { id: true, nombre: true, codigo: true } } },
    orderBy: { orden: 'asc' as const },
  },
};

@Injectable()
export class CotizacionesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, estado?: string, sort?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
        { vendedor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = sort === 'asc' ? { fecha: 'asc' as const } : { fecha: 'desc' as const };

    return this.prisma.cotizacion.findMany({
      where,
      include: { cliente: { select: { id: true, razonSocial: true, nit: true } }, items: true },
      orderBy,
    });
  }

  async findOne(id: string) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });
    if (!cotizacion) throw new NotFoundException(`Cotización ${id} no encontrada`);
    return cotizacion;
  }

  async create(dto: CreateCotizacionDto) {
    const { items, fecha, vigencia, ...rest } = dto;
    return this.prisma.cotizacion.create({
      data: {
        ...rest,
        fecha: fecha ? new Date(fecha) : undefined,
        vigencia: vigencia ? new Date(vigencia) : undefined,
        items: items ? { create: items } : undefined,
      },
      include: INCLUDE_FULL,
    });
  }

  async update(id: string, dto: UpdateCotizacionDto) {
    await this.findOne(id);
    const { items, vigencia, ...rest } = dto;

    // Si se envían items, reemplazar todos
    if (items !== undefined) {
      await this.prisma.cotizacionItem.deleteMany({ where: { cotizacionId: id } });
    }

    return this.prisma.cotizacion.update({
      where: { id },
      data: {
        ...rest,
        vigencia: vigencia ? new Date(vigencia) : undefined,
        items: items ? { create: items } : undefined,
      },
      include: INCLUDE_FULL,
    });
  }
}
