const request = require('supertest');
const app = require('../../app');
const Tour = require('../../models/tourModel');
const Booking = require('../../models/bookingModel');
const { createTestUser, createAdminUser } = require('../setup/testHelpers');

describe('Bookings Endpoints', () => {
  let adminToken;
  let userToken;
  let userId;
  let tourId;
  let bookingId;

  const sampleTourData = {
    name: 'Test Tour for Bookings',
    duration: 5,
    maxGroupSize: 25,
    difficulty: 'easy',
    ratingsAverage: 4.5,
    ratingsQuantity: 20,
    price: 499,
    summary: 'A test tour for booking testing',
    description: 'This is a detailed description of the test tour.',
    imageCover: 'tour-cover.jpg',
    startDates: [new Date('2024-06-01')],
    startLocation: {
      type: 'Point',
      coordinates: [-80.185942, 25.774772],
      address: '301 Biscayne Blvd, Miami, FL 33132, USA',
      description: 'Miami, USA',
    },
  };

  beforeEach(async () => {
    const admin = await createAdminUser();
    adminToken = admin.token;
    const user = await createTestUser();
    userToken = user.token;
    userId = user.user._id;

    const tour = await Tour.create(sampleTourData);
    tourId = tour._id;

    const booking = await Booking.create({
      tour: tourId,
      user: userId,
      price: 499,
      createdAt: new Date(),
      paid: true,
    });
    bookingId = booking._id;
  });

  describe('GET /api/v1/bookings', () => {
    it('should get all bookings as admin', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should get booking by ID as admin', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data._id).toBe(bookingId.toString());
      expect(response.body.data.data.tour).toBeDefined();
      expect(response.body.data.data.user).toBeDefined();
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a new booking as admin', async () => {
      const user2 = await createTestUser({ 
        email: 'user2@example.com',
        name: 'User 2'
      });

      const bookingData = {
        tour: tourId,
        user: user2.user._id,
        price: 499,
        paid: true,
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.tour).toBe(tourId.toString());
      expect(response.body.data.data.user).toBe(user2.user._id.toString());
      expect(response.body.data.data.price).toBe(bookingData.price);
    });

    it('should return 403 for regular user', async () => {
      const bookingData = {
        tour: tourId,
        user: userId,
        price: 499,
        paid: true,
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for missing required fields', async () => {
      const bookingData = {
        tour: tourId,
        // Missing user and price
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/v1/bookings/:id', () => {
    it('should update booking as admin', async () => {
      const updateData = {
        price: 599,
        paid: false,
      };

      const response = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.price).toBe(updateData.price);
      expect(response.body.data.data.paid).toBe(updateData.paid);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 599 })
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/api/v1/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 599 })
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should delete booking as admin', async () => {
      await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedBooking = await Booking.findById(bookingId);
      expect(deletedBooking).toBeNull();
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/bookings/checkout-session/:tourID', () => {
    it('should create checkout session for authenticated user', async () => {
      // Mock Stripe for testing environment
      process.env.NODE_ENV = 'test';
      
      const response = await request(app)
        .get(`/api/v1/bookings/checkout-session/${tourId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.session).toBeDefined();
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/checkout-session/${tourId}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent tour', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/bookings/checkout-session/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});