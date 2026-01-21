import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterArticleDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por título (busca parcial, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID do autor',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}
