const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModel');
const { createTestUser } = require('../setup/testHelpers');

describe('Authentication Endpoints', () => {
  describe('POST /api/v1/users/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/users/signup')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/users/signup')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return error when passwords do not match', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'differentpassword',
      };

      const response = await request(app)
        .post('/api/v1/users/signup')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return error for duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const userData = {
        name: 'Another User',
        email: 'duplicate@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/users/signup')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
    });

    it('should return error for incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return error when email or password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'login@example.com',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/users/forgotPassword', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'forgot@example.com',
        password: 'password123',
      });
    });

    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgotPassword')
        .send({
          email: 'forgot@example.com',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Token sent to email');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgotPassword')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/v1/users/updateMyPassword', () => {
    let userToken;

    beforeEach(async () => {
      const { token } = await createTestUser({
        email: 'updatepassword@example.com',
        password: 'oldpassword123',
      });
      userToken = token;
    });

    it('should update user password successfully', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          passwordCurrent: 'oldpassword123',
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
    });

    it('should return error for incorrect current password', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          passwordCurrent: 'wrongpassword',
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return error when not authenticated', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .send({
          passwordCurrent: 'oldpassword123',
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });
});