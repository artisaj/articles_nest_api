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
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Roles(Role.ADMIN, Role.EDITOR)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('OPTIONS')
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
  findAll() {
    return this.articlesService.findAll();
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.READER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
