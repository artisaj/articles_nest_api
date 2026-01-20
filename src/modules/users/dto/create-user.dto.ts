import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Silva',
    minLength: 3,
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'E-mail único do usuário (será usado para login)',
    example: 'maria.silva@example.com',
    format: 'email',
    uniqueItems: true,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description:
      'Senha do usuário (mínimo 6 caracteres, recomendado usar letras, números e símbolos)',
    example: 'SenhaSegura@2024',
    minLength: 6,
    format: 'password',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
