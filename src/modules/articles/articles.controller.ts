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
  Query,
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
import { FilterArticleDto } from './dto/filter-article.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Artigos')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'articles', version: '1' })
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Roles(Role.ADMIN, Role.EDITOR)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo artigo',
    description:
      'Cria um novo artigo no sistema. Apenas usuários com permissão ADMIN ou EDITOR podem criar artigos. O autor será automaticamente definido como o usuário autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Artigo criado com sucesso',
    schema: {
      example: {
        id: '789e4567-e89b-12d3-a456-426614174002',
        title: 'Como implementar autenticação JWT em NestJS',
        content:
          '# Introdução ao NestJS\n\nNestJS é um framework progressivo para construção de aplicações server-side...',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2024-01-20T11:00:00.000Z',
        updatedAt: '2024-01-20T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token inválido ou ausente',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão - Usuário não possui role ADMIN ou EDITOR',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'title should not be empty',
          'title must be shorter than or equal to 255 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Listar todos os artigos com paginação e filtros',
    description:
      'Retorna uma lista paginada de artigos com suporte a filtros e ordenação. Suporta filtros por título e ID do autor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de artigos',
    schema: {
      example: {
        data: [
          {
            id: '789e4567-e89b-12d3-a456-426614174002',
            title: 'Como implementar autenticação JWT em NestJS',
            content:
              '# Introdução ao NestJS\n\nNestJS é um framework progressivo...',
            creatorId: '123e4567-e89b-12d3-a456-426614174000',
            creator: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Maria Silva',
              email: 'maria.silva@example.com',
            },
            createdAt: '2024-01-20T11:00:00.000Z',
            updatedAt: '2024-01-20T11:00:00.000Z',
          },
          {
            id: '889e4567-e89b-12d3-a456-426614174003',
            title: 'Introdução ao Prisma ORM',
            content: 'Prisma é um ORM moderno para Node.js e TypeScript...',
            creatorId: '223e4567-e89b-12d3-a456-426614174001',
            creator: {
              id: '223e4567-e89b-12d3-a456-426614174001',
              name: 'João Santos',
              email: 'joao.santos@example.com',
            },
            createdAt: '2024-01-19T16:30:00.000Z',
            updatedAt: '2024-01-19T16:30:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  findAll(@Query() filterDto: FilterArticleDto) {
    return this.articlesService.findAll(filterDto);
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.READER)
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar artigo por ID',
    description: 'Retorna os dados de um artigo específico pelo seu ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Artigo encontrado',
    schema: {
      example: {
        id: '789e4567-e89b-12d3-a456-426614174002',
        title: 'Como implementar autenticação JWT em NestJS',
        content:
          '# Introdução ao NestJS\n\nNestJS é um framework progressivo para construção de aplicações server-side eficientes e escaláveis...',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2024-01-20T11:00:00.000Z',
        updatedAt: '2024-01-20T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Artigo não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Artigo não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
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
