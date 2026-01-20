import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .setTitle('API de Gerenciamento de Artigos')
    .setDescription('API REST para gerenciamento de artigos com autenticação JWT e controle de permissões (RBAC)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Informe o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = environment.port;
  await app.listen(port);

  console.log(`[CORE] Application running on: http://localhost:${port}`);
  console.log(`[CORE] Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
