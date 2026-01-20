import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
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
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
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
      .post('/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123',
      });
    adminToken = adminResponse.body.access_token;

    // Create and login as editor
    const editorUserResponse = await request(app.getHttpServer())
      .post('/v1/users')
      .send({
        name: 'Editor E2E',
        email: 'editor.e2e@example.com',
        password: 'Editor@123',
      });
    const editorUserId = editorUserResponse.body.id;

    await request(app.getHttpServer())
      .post(`/v1/users/${editorUserId}/permissions/EDITOR`)
      .set('Authorization', `Bearer ${adminToken}`);
    const editorResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'editor.e2e@example.com',
        password: 'Editor@123',
      });
    editorToken = editorResponse.body.access_token;

    // Create and login as reader
    const readerUserResponse = await request(app.getHttpServer())
      .post('/v1/users')
      .send({
        name: 'Reader E2E',
        email: 'reader.e2e@example.com',
        password: 'Reader@123',
      });
    const readerUserId = readerUserResponse.body.id;

    await request(app.getHttpServer())
      .post(`/v1/users/${readerUserId}/permissions/READER`)
      .set('Authorization', `Bearer ${adminToken}`);
    const readerResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'reader.e2e@example.com',
        password: 'Reader@123',
      });
    readerToken = readerResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/articles (POST)', () => {
    it('should create article with ADMIN role', () => {
      return request(app.getHttpServer())
        .post('/v1/articles')
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
        .post('/v1/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Editor Article',
          content: 'Article by editor',
        })
        .expect(201);
    });

    it('should reject article creation with READER role', () => {
      return request(app.getHttpServer())
        .post('/v1/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Reader Article',
          content: 'Should fail',
        })
        .expect(403);
    });

    it('should reject unauthenticated article creation', () => {
      return request(app.getHttpServer())
        .post('/v1/articles')
        .send({
          title: 'Unauthenticated Article',
          content: 'Should fail',
        })
        .expect(401);
    });

    it('should reject article with missing title', () => {
      return request(app.getHttpServer())
        .post('/v1/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Missing title',
        })
        .expect(400);
    });

    it('should reject article with empty content', () => {
      return request(app.getHttpServer())
        .post('/v1/articles')
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
        .get('/v1/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta).toHaveProperty('page', 1);
          expect(res.body.meta).toHaveProperty('limit', 10);
        });
    });

    it('should list articles with EDITOR role', () => {
      return request(app.getHttpServer())
        .get('/v1/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should list articles with READER role', () => {
      return request(app.getHttpServer())
        .get('/v1/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should reject unauthenticated listing', () => {
      return request(app.getHttpServer()).get('/v1/articles').expect(401);
    });

    it('should support pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/v1/articles?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should support title filter', () => {
      return request(app.getHttpServer())
        .get('/v1/articles?title=E2E')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/articles/:id (GET)', () => {
    it('should get specific article with READER role', () => {
      return request(app.getHttpServer())
        .get(`/v1/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdArticleId);
          expect(res.body).toHaveProperty('title', 'E2E Test Article');
        });
    });

    it('should return 404 for non-existent article', () => {
      return request(app.getHttpServer())
        .get('/v1/articles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/articles/:id (PATCH)', () => {
    it('should update article with ADMIN role', () => {
      return request(app.getHttpServer())
        .patch(`/v1/articles/${createdArticleId}`)
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
        .patch(`/v1/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          content: 'Updated content by editor',
        })
        .expect(200);
    });

    it('should reject update with READER role', () => {
      return request(app.getHttpServer())
        .patch(`/v1/articles/${createdArticleId}`)
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
        .delete(`/v1/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(403);
    });

    it('should delete article with EDITOR role', () => {
      return request(app.getHttpServer())
        .delete(`/v1/articles/${createdArticleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(204);
    });

    it('should reject unauthenticated delete', () => {
      return request(app.getHttpServer())
        .delete('/v1/articles/some-id')
        .expect(401);
    });
  });
});
