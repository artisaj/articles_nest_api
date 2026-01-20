import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Configurar Pino Logger
  app.useLogger(app.get(Logger));
  app.flushLogs();

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Enable API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    preflightContinue: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Articles API')
    .setDescription(
      `**API REST para gerenciamento de artigos com autenticação JWT e controle de permissões (RBAC)**

## Guia Rápido

### Autenticação
1. **Criar usuário**: POST \`/users\` (endpoint público)
2. **Fazer login**: POST \`/auth/login\` - retorna token JWT
3. **Autorizar**: Clique em "Authorize" e cole o token (sem "Bearer")
4. **Usar API**: Todas as requisições autenticadas funcionarão

### Fluxo Básico
\`\`\`
POST /users          → Criar conta
POST /auth/login     → Obter token
GET  /articles       → Listar artigos (requer auth)
POST /articles       → Criar artigo (requer auth)
\`\`\`

### Headers Customizados
- **X-Request-Id**: ID único de rastreamento (gerado automaticamente ou fornecido)

### Recursos
- Autenticação JWT com refresh token
- Rate limiting (10 req/min)
- Logs estruturados com Pino
- Health checks: \`/health\`, \`/health/live\`, \`/health/ready\`
- Repositório: [GitHub](https://github.com/artisaj/articles_nest_api)

---
`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Informe o token JWT obtido no endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Request-Id',
        in: 'header',
        description:
          'ID único para rastreamento de requisições (opcional - gerado automaticamente se não fornecido)',
      },
      'Request-ID',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Carregar CSS customizado
  const customCss = fs.readFileSync(
    path.join(__dirname, 'config', 'swagger.css'),
    'utf8',
  );

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
      displayOperationId: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Articles API - Documentation',
    customCss,
    customCssUrl: '',
  });

  const port = environment.port;
  const logger = app.get(Logger);

  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api`);
  logger.log(`Health check: http://localhost:${port}/health`);
}

bootstrap();
