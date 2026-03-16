import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SELECT_SAFE = {
  id: true,
  username: true,
  nombre: true,
  cargo: true,
  email: true,
  telefono: true,
  role: true,
  activo: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ select: SELECT_SAFE, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SELECT_SAFE });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existe = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existe) throw new ConflictException(`El username "${dto.username}" ya existe`);

    const emailExiste = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExiste) throw new ConflictException(`El email "${dto.email}" ya está registrado`);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const { password, ...rest } = dto;

    return this.prisma.user.create({
      data: { ...rest, passwordHash },
      select: SELECT_SAFE,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: SELECT_SAFE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });
    return { message: `Usuario ${id} desactivado` };
  }
}
