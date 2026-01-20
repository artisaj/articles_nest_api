import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Admin@123',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
