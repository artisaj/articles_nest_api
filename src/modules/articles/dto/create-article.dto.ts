import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Título do artigo (deve ser único e descritivo)',
    example: 'Como implementar autenticação JWT em NestJS',
    maxLength: 255,
    minLength: 5,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Conteúdo completo do artigo (suporta Markdown)',
    example: `# Introdução ao NestJS

NestJS é um framework progressivo para construção de aplicações server-side eficientes e escaláveis com Node.js.

## Principais Características

- **TypeScript First**: Totalmente escrito em TypeScript
- **Arquitetura Modular**: Organização clara e escalável
- **Injeção de Dependências**: IoC container nativo
- **Decorators**: Sintaxe elegante e expressiva

## Exemplo de Uso

\`\`\`typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
\`\`\`

## Conclusão

NestJS oferece uma experiência de desenvolvimento moderna e produtiva.`,
    minLength: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  content!: string;
}
