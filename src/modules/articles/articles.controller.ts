import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  Options,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Artigos')
@ApiBearerAuth('JWT-auth')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Roles(Role.ADMIN, Role.EDITOR)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo artigo',
    description: 'Apenas ADMIN e EDITOR podem criar artigos',
  })
  @ApiResponse({ status: 201, description: 'Artigo criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  @Public()
  @Options()
  @HttpCode(HttpStatus.OK)
  @Header('Allow', 'GET,POST,PATCH,DELETE,OPTIONS')
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'Obter informações sobre endpoints de artigos' })
  @ApiResponse({ status: 200, description: 'Informações dos endpoints' })
  options() {
    return {
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      endpoints: {
        'GET /articles': {
          description: 'List all articles',
          roles: ['ADMIN', 'EDITOR', 'READER'],
        },
        'GET /articles/:id': {
          description: 'Get a specific article',
          roles: ['ADMIN', 'EDITOR', 'READER'],
        },
        'POST /articles': {
          description: 'Create a new article',
          roles: ['ADMIN', 'EDITOR'],
        },
        'PATCH /articles/:id': {
          description: 'Update an article',
          roles: ['ADMIN', 'EDITOR'],
        },
        'DELETE /articles/:id': {
          description: 'Delete an article',
          roles: ['ADMIN', 'EDITOR'],
        },
      },
    };
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.READER)
  @Get()
  @ApiOperation({ summary: 'Listar todos os artigos' })
  @ApiResponse({ status: 200, description: 'Lista de artigos' })
  findAll() {
    return this.articlesService.findAll();
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.READER)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar artigo por ID' })
  @ApiResponse({ status: 200, description: 'Artigo encontrado' })
  @ApiResponse({ status: 404, description: 'Artigo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar artigo',
    description: 'Apenas ADMIN e EDITOR',
  })
  @ApiResponse({ status: 200, description: 'Artigo atualizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Artigo não encontrado' })
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar artigo',
    description: 'Apenas ADMIN e EDITOR',
  })
  @ApiResponse({ status: 204, description: 'Artigo deletado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Artigo não encontrado' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
