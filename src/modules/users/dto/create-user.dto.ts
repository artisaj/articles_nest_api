import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    minLength: 3,
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'E-mail único do usuário (será usado para login)',
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
    minLength: 6,
    format: 'password',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
