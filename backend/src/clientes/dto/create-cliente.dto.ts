import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'C006' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Empresa ABC S.A.S.' })
  @IsString()
  razonSocial: string;

  @ApiProperty({ example: '900.000.000-0' })
  @IsString()
  nit: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contacto?: string;

  @ApiPropertyOptional({ example: 'Responsable de IVA' })
  @IsOptional()
  @IsString()
  regimen?: string;
}
