import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'indusvit.admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'indusvit123' })
  @IsString()
  @MinLength(6)
  password: string;
}
