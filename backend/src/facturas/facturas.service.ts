import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

const INCLUDE_FULL = {
  cliente: { select: { id: true, razonSocial: true, nit: true } },
  cotizacion: { select: { id: true, estado: true } },
  items: {
    include: { producto: { select: { id: true, nombre: true, codigo: true } } },
    orderBy: { orden: 'asc' as const },
  },
};

@Injectable()
export class FacturasService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, estadoDian?: string, sort?: string) {
    const where: any = {};
    if (estadoDian) where.estadoDian = estadoDian;
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const orderBy = sort === 'asc' ? { fecha: 'asc' as const } : { fecha: 'desc' as const };
    return this.prisma.factura.findMany({
      where,
      include: { cliente: { select: { id: true, razonSocial: true, nit: true } } },
      orderBy,
    });
  }

  async findOne(id: string) {
    const factura = await this.prisma.factura.findUnique({ where: { id }, include: INCLUDE_FULL });
    if (!factura) throw new NotFoundException(`Factura ${id} no encontrada`);
    return factura;
  }

  async create(dto: CreateFacturaDto) {
    const existe = await this.prisma.factura.findUnique({ where: { id: dto.id } });
    if (existe) throw new ConflictException(`Factura ${dto.id} ya existe`);

    const numeroExiste = await this.prisma.factura.findUnique({ where: { numero: dto.numero } });
    if (numeroExiste) throw new ConflictException(`El número de factura ${dto.numero} ya está en uso`);

    const { items, fecha, fechaVencimiento, ...rest } = dto;
    return this.prisma.factura.create({
      data: {
        ...rest,
        fecha: fecha ? new Date(fecha) : undefined,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
        items: items ? { create: items } : undefined,
      },
      include: INCLUDE_FULL,
    });
  }

  async update(id: string, dto: UpdateFacturaDto) {
    await this.findOne(id);
    const { items, fechaVencimiento, fechaAceptacionDian, ...rest } = dto;

    if (items !== undefined) {
      await this.prisma.facturaItem.deleteMany({ where: { facturaId: id } });
    }

    return this.prisma.factura.update({
      where: { id },
      data: {
        ...rest,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
        fechaAceptacionDian: fechaAceptacionDian ? new Date(fechaAceptacionDian) : undefined,
        items: items ? { create: items } : undefined,
      },
      include: INCLUDE_FULL,
    });
  }
}
