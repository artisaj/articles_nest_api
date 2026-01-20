import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail cadastrado do usuário',
    example: 'maria.silva@example.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaSegura@2024',
    format: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
