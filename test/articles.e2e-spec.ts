import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Articles CRUD (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let editorToken: string;
  let readerToken: string;
  let createdArticleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login as admin
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123',
      });
    adminToken = adminResponse.body.access_token;

    // Create and login as editor
    await request(app.getHttpServer()).post('/users').send({
      name: 'Editor E2E',
      email: 'editor.e2e@example.com',
      password: 'Editor@123',
    });
    await request(app.getHttpServer())
      .post(
        '/users/' +
          (await getUserId('editor.e2e@example.com')) +
          '/permissions/EDITOR',
      )
      .set('Authorization', `Bearer ${adminToken}`);
    const editorResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'editor.e2e@example.com',
        password: 'Editor@123',
      });
    editorToken = editorResponse.body.access_token;

    // Create and login as reader
    await request(app.getHttpServer()).post('/users').send({
      name: 'Reader E2E',
      email: 'reader.e2e@example.com',
      password: 'Reader@123',
    });
    await request(app.getHttpServer())
      .post(
        '/users/' +
          (await getUserId('reader.e2e@example.com')) +
          '/permissions/READER',
      )
      .set('Authorization', `Bearer ${adminToken}`);
    const readerResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'reader.e2e@example.com',
        password: 'Reader@123',
      });
    readerToken = readerResponse.body.access_token;
  });

  async function getUserId(email: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    const user = response.body.find((u: any) => u.email === email);
    return user.id;
  }

  afterAll(async () => {
    await app.close();
  });

  describe('/articles (POST)', () => {
    it('should create article with ADMIN role', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Article',
          content: 'This is a test article content',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', 'E2E Test Article');
          expect(res.body).toHaveProperty(
            'content',
            'This is a test article content',
          );
          expect(res.body).toHaveProperty('creator');
          createdArticleId = res.body.id;
        });
    });

    it('should create article with EDITOR role', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Editor Article',
          content: 'Article by editor',
        })
        .expect(201);
    });

    it('should reject article creation with READER role', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Reader Article',
          content: 'Should fail',
        })
        .expect(403);
    });

    it('should reject unauthenticated article creation', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .send({
          title: 'Unauthenticated Article',
          content: 'Should fail',
        })
        .expect(401);
    });

    it('should reject article with missing title', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Missing title',
        })
        .expect(400);
    });

    it('should reject article with empty content', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Empty content article',
          content: '',
        })
        .expect(400);
    });
  });

  describe('/articles (GET)', () => {
    it('should list articles with ADMIN role', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should list articles with EDITOR role', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);
    });

    it('should list articles with READER role', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200);
    });

    it('should reject unauthenticated listing', () => {
      return request(app.getHttpServer()).get('/articles').expect(401);
    });
  });

  describe('/articles/:id (GET)', () => {
    it('should get specific article with READER role', () => {
      return request(app.getHttpServer())
        .get(`/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdArticleId);
          expect(res.body).toHaveProperty('title', 'E2E Test Article');
        });
    });

    it('should return 404 for non-existent article', () => {
      return request(app.getHttpServer())
        .get('/articles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/articles/:id (PATCH)', () => {
    it('should update article with ADMIN role', () => {
      return request(app.getHttpServer())
        .patch(`/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title E2E',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Updated Title E2E');
        });
    });

    it('should update article with EDITOR role', () => {
      return request(app.getHttpServer())
        .patch(`/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          content: 'Updated content by editor',
        })
        .expect(200);
    });

    it('should reject update with READER role', () => {
      return request(app.getHttpServer())
        .patch(`/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Should fail',
        })
        .expect(403);
    });
  });

  describe('/articles/:id (DELETE)', () => {
    it('should reject delete with READER role', () => {
      return request(app.getHttpServer())
        .delete(`/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(403);
    });

    it('should delete article with EDITOR role', () => {
      return request(app.getHttpServer())
        .delete(`/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(204);
    });

    it('should reject unauthenticated delete', () => {
      return request(app.getHttpServer())
        .delete('/articles/some-id')
        .expect(401);
    });
  });
});
