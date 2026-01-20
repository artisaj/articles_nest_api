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
  Options,
  Header,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionsService } from '../permissions/permissions.service';

@ApiTags('Usuários')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário',
    description:
      'Cria um novo usuário no sistema. Este endpoint é público e não requer autenticação. O e-mail deve ser único.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        createdAt: '2024-01-20T10:30:00.000Z',
        updatedAt: '2024-01-20T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou e-mail já existe',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than 6 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail já cadastrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'E-mail já está em uso',
        error: 'Conflict',
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Options()
  @HttpCode(HttpStatus.OK)
  @Header('Allow', 'GET,POST,PATCH,DELETE,OPTIONS')
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'Obter informações sobre endpoints disponíveis' })
  @ApiResponse({ status: 200, description: 'Informações dos endpoints' })
  options() {
    return {
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      endpoints: {
        'GET /users': {
          description: 'List all users',
          authentication: 'required',
        },
        'GET /users/:id': {
          description: 'Get a specific user',
          authentication: 'required',
        },
        'POST /users': {
          description: 'Create a new user',
          authentication: 'public',
        },
        'PATCH /users/:id': {
          description: 'Update a user',
          authentication: 'required',
        },
        'DELETE /users/:id': {
          description: 'Delete a user',
          authentication: 'required',
        },
        'POST /users/:userId/permissions/:permissionName': {
          description: 'Assign a permission to a user',
          authentication: 'required',
        },
      },
    };
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos os usuários com paginação e filtros',
    description:
      'Retorna uma lista paginada de usuários com suporte a filtros e ordenação. Suporta filtros por nome e email (case-insensitive).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuários',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Maria Silva',
            email: 'maria.silva@example.com',
            createdAt: '2024-01-20T10:30:00.000Z',
            updatedAt: '2024-01-20T10:30:00.000Z',
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            name: 'João Santos',
            email: 'joao.santos@example.com',
            createdAt: '2024-01-19T15:20:00.000Z',
            updatedAt: '2024-01-19T15:20:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
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
  findAll(@Query() filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Retorna os dados de um usuário específico pelo seu ID. Requer autenticação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        createdAt: '2024-01-20T10:30:00.000Z',
        updatedAt: '2024-01-20T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
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
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiResponse({ status: 204, description: 'Usuário deletado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':userId/permissions/:permissionName')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atribuir permissão a usuário' })
  @ApiResponse({ status: 200, description: 'Permissão atribuída' })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou permissão não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário já possui esta permissão',
  })
  @HttpCode(HttpStatus.OK)
  async assignPermission(
    @Param('userId') userId: string,
    @Param('permissionName') permissionName: string,
  ) {
    const permission = await this.permissionsService.findByName(permissionName);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return this.permissionsService.assignPermissionToUser(
      userId,
      permission.id,
    );
  }
}
