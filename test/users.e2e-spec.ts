import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users CRUD (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdUserId: string;

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

    // Login to get admin token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123',
      });
    adminToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user without authentication', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User E2E',
          email: 'test.e2e@example.com',
          password: 'Test@123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'test.e2e@example.com');
          expect(res.body).toHaveProperty('name', 'Test User E2E');
          expect(res.body).not.toHaveProperty('password');
          createdUserId = res.body.id;
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Duplicate User',
          email: 'admin@example.com',
          password: 'Test@123',
        })
        .expect(409); // Conflict status code
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Invalid Email User',
          email: 'invalid-email',
          password: 'Test@123',
        })
        .expect(400);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Weak Password User',
          email: 'weak@example.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should list all users when authenticated', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get a specific user when authenticated', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdUserId);
          expect(res.body).toHaveProperty('email', 'test.e2e@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update user when authenticated', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name E2E',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Name E2E');
        });
    });

    it('should reject unauthenticated update', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send({
          name: 'Should Fail',
        })
        .expect(401);
    });
  });

  describe('/users/:userId/permissions/:permissionName (POST)', () => {
    it('should assign permission to user', () => {
      return request(app.getHttpServer())
        .post(`/users/${createdUserId}/permissions/READER`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('permissionId');
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete user when authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should reject unauthenticated delete', () => {
      return request(app.getHttpServer()).delete('/users/some-id').expect(401);
    });
  });
});
