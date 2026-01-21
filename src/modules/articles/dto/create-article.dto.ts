import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Título do artigo (deve ser único e descritivo)',
    maxLength: 255,
    minLength: 5,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Conteúdo completo do artigo (suporta Markdown)',
    minLength: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  content!: string;
}
