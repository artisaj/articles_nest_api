import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

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

  async findAll() {
    this.logger.debug('Fetching all articles');
    return this.prisma.article.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
