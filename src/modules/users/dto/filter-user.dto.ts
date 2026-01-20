import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterUserDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nome (busca parcial, case-insensitive)',
    example: 'Maria',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por email (busca parcial, case-insensitive)',
    example: 'maria@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
