import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectPinoLogger(ArticlesService.name)
    private readonly logger: PinoLogger,
    private prisma: PrismaService,
  ) {}

  async create(createArticleDto: CreateArticleDto, creatorId: string) {
    this.logger.info(
      { creatorId, title: createArticleDto.title },
      'Creating new article',
    );

    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        content: createArticleDto.content,
        creator: {
          connect: { id: creatorId },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.info(
      { articleId: article.id, creatorId, title: article.title },
      'Article created successfully',
    );
    return article;
  }

  async findAll(filterDto: FilterArticleDto) {
    this.logger.info({ filters: filterDto }, 'Listing articles with filters');

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      title,
      authorId,
    } = filterDto;

    const skip = (page - 1) * limit;

    // Construir filtros dinâmicos
    const where: any = {};

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    if (authorId) {
      where.creatorId = authorId;
    }

    // Buscar total de registros
    const total = await this.prisma.article.count({ where });

    // Buscar dados paginados
    const articles = await this.prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: articles,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    this.logger.debug({ articleId: id }, 'Fetching article by ID');

    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      this.logger.warn({ articleId: id }, 'Article not found');
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    this.logger.info({ articleId: id }, 'Updating article');
    await this.findOne(id);

    const article = await this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.info({ articleId: id }, 'Article updated successfully');
    return article;
  }

  async remove(id: string) {
    this.logger.info({ articleId: id }, 'Deleting article');
    await this.findOne(id);

    await this.prisma.article.delete({
      where: { id },
    });

    this.logger.info({ articleId: id }, 'Article deleted successfully');
  }
}
