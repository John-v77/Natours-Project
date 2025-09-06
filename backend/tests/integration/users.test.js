const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModel');
const { createTestUser, createAdminUser } = require('../setup/testHelpers');

describe('Users Endpoints', () => {
  let adminToken;
  let userToken;
  let userId;

  beforeEach(async () => {
    const admin = await createAdminUser();
    adminToken = admin.token;
    const user = await createTestUser();
    userToken = user.token;
    userId = user.user._id;
  });

  describe('GET /api/v1/users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by ID as admin', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data._id).toBe(userId.toString());
      expect(response.body.data.data.password).toBeUndefined();
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user as admin', async () => {
      const updateData = {
        name: 'Updated Name',
        role: 'guide',
      };

      const response = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.name).toBe(updateData.name);
      expect(response.body.data.data.role).toBe(updateData.role);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should not update password through this endpoint', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: 'newpassword123' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user as admin', async () => {
      await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data._id).toBe(userId.toString());
      expect(response.body.data.data.password).toBeUndefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/v1/users/updateMe', () => {
    it('should update current user data', async () => {
      const updateData = {
        name: 'Updated User Name',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe(updateData.email);
    });

    it('should not allow password update', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: 'newpassword123' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should not allow role update', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/v1/users/deleteMe', () => {
    it('should deactivate current user account', async () => {
      const response = await request(app)
        .delete('/api/v1/users/deleteMe')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      const user = await User.findById(userId);
      expect(user.active).toBe(false);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete('/api/v1/users/deleteMe')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });
});