import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Título do artigo',
    example: 'Introdução ao NestJS',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Conteúdo do artigo',
    example:
      'NestJS é um framework progressivo para construção de aplicações server-side eficientes e escaláveis...',
  })
  @IsNotEmpty()
  @IsString()
  content!: string;
}
