import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterUserDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nome (busca parcial, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por email (busca parcial, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
