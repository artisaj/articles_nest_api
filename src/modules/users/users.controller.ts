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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionsService } from '../permissions/permissions.service';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
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
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
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
  @ApiResponse({ status: 404, description: 'Usuário ou permissão não encontrado' })
  @HttpCode(HttpStatus.OK)
  async assignPermission(
    @Param('userId') userId: string,
    @Param('permissionName') permissionName: string,
  ) {
    const permission = await this.permissionsService.findByName(permissionName);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return this.permissionsService.assignPermissionToUser(
      userId,
      permission.id,
    );
  }
}
