import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Permissions & RBAC (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let editorToken: string;
  let readerToken: string;

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

    // Create editor user
    const editorUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Editor Permission Test',
        email: 'editor.perm@example.com',
        password: 'Editor@123',
      });
    const editorUserId = editorUserResponse.body.id;

    // Assign EDITOR permission
    await request(app.getHttpServer())
      .post(`/users/${editorUserId}/permissions/EDITOR`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Login as editor
    const editorLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'editor.perm@example.com',
        password: 'Editor@123',
      });
    editorToken = editorLoginResponse.body.access_token;

    // Create reader user
    const readerUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Reader Permission Test',
        email: 'reader.perm@example.com',
        password: 'Reader@123',
      });
    const readerUserId = readerUserResponse.body.id;

    // Assign READER permission
    await request(app.getHttpServer())
      .post(`/users/${readerUserId}/permissions/READER`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Login as reader
    const readerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'reader.perm@example.com',
        password: 'Reader@123',
      });
    readerToken = readerLoginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('ADMIN role permissions', () => {
    it('should allow ADMIN to create users', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'User by Admin',
          email: `admin.created.${Date.now()}@example.com`,
          password: 'Test@123',
        })
        .expect(201);
    });

    it('should allow ADMIN to create articles', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Article',
          content: 'Content by admin',
        })
        .expect(201);
    });

    it('should allow ADMIN to read articles', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should allow ADMIN to read users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('EDITOR role permissions', () => {
    it('should allow EDITOR to create articles', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Editor Article',
          content: 'Content by editor',
        })
        .expect(201);
    });

    it('should allow EDITOR to read articles', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);
    });

    it('should allow EDITOR to read users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);
    });
  });

  describe('READER role permissions', () => {
    it('should reject READER creating articles', () => {
      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Reader Article',
          content: 'Should fail',
        })
        .expect(403);
    });

    it('should allow READER to read articles', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200);
    });

    it('should allow READER to read users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200);
    });

    it('should reject READER updating articles', async () => {
      // First create an article as admin
      const createResponse = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Article to test update',
          content: 'Content',
        });

      const articleId = createResponse.body.id;

      // Try to update as reader
      return request(app.getHttpServer())
        .patch(`/articles/${articleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Should fail',
        })
        .expect(403);
    });

    it('should reject READER deleting articles', async () => {
      // First create an article as admin
      const createResponse = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Article to test delete',
          content: 'Content',
        });

      const articleId = createResponse.body.id;

      // Try to delete as reader
      return request(app.getHttpServer())
        .delete(`/articles/${articleId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(403);
    });
  });

  describe('JWT token validation', () => {
    it('should include permissions in JWT payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin@123',
        });

      expect(response.body.user.permissions).toContain('ADMIN');
    });

    it('should reject invalid JWT token', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired or malformed token', () => {
      return request(app.getHttpServer())
        .get('/articles')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        )
        .expect(401);
    });
  });
});
