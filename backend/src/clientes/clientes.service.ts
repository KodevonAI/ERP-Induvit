import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, activo?: boolean) {
    const where: any = {};

    if (activo !== undefined) where.activo = activo;

    if (search) {
      where.OR = [
        { razonSocial: { contains: search, mode: 'insensitive' } },
        { nit: { contains: search, mode: 'insensitive' } },
        { contacto: { contains: search, mode: 'insensitive' } },
        { ciudad: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.cliente.findMany({
      where,
      orderBy: { razonSocial: 'asc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  async create(dto: CreateClienteDto) {
    const nitExiste = await this.prisma.cliente.findUnique({ where: { nit: dto.nit } });
    if (nitExiste) throw new ConflictException(`El NIT "${dto.nit}" ya está registrado`);

    return this.prisma.cliente.create({ data: dto });
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id);

    if (dto.nit) {
      const nitExiste = await this.prisma.cliente.findFirst({
        where: { nit: dto.nit, id: { not: id } },
      });
      if (nitExiste) throw new ConflictException(`El NIT "${dto.nit}" ya está registrado`);
    }

    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.cliente.update({
      where: { id },
      data: { activo: false },
    });
    return { message: `Cliente ${id} desactivado` };
  }
}
