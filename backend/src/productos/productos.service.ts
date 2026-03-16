import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, categoria?: string, activo?: boolean) {
    const where: any = {};

    if (activo !== undefined) where.activo = activo;
    if (categoria) where.categoria = { contains: categoria, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { categoria: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.producto.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto) {
    const codigoExiste = await this.prisma.producto.findUnique({ where: { codigo: dto.codigo } });
    if (codigoExiste) throw new ConflictException(`El código "${dto.codigo}" ya existe`);

    const id = dto.id ?? await this.generateId();
    return this.prisma.producto.create({ data: { ...dto, id } });
  }

  private async generateId(): Promise<string> {
    const last = await this.prisma.producto.findFirst({
      where: { id: { startsWith: 'P' } },
      orderBy: { id: 'desc' },
    });
    const seq = last ? parseInt(last.id.replace(/\D/g, '')) + 1 : 1;
    return `P${String(seq).padStart(3, '0')}`;
  }

  async update(id: string, dto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  async toggleActivo(id: string, activo: boolean) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: { activo },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
    return { message: `Producto ${id} desactivado` };
  }
}
