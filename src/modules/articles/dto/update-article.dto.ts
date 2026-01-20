import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiPropertyOptional({
    description: 'Título do artigo',
    example: 'Introdução ao NestJS - Atualizado',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Conteúdo do artigo',
    example: 'Conteúdo atualizado do artigo...',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
