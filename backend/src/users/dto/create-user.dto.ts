import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'indusvit.nuevo' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'indusvit123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ana García' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiProperty({ example: 'ana@indusvit.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ enum: Role, default: Role.VENTAS })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
