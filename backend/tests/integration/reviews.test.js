const request = require('supertest');
const app = require('../../app');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const Booking = require('../../models/bookingModel');
const { createTestUser, createAdminUser } = require('../setup/testHelpers');

describe('Reviews Endpoints', () => {
  let adminToken;
  let userToken;
  let userId;
  let tourId;
  let reviewId;

  const sampleTourData = {
    name: 'Test Tour for Reviews',
    duration: 5,
    maxGroupSize: 25,
    difficulty: 'easy',
    ratingsAverage: 4.5,
    ratingsQuantity: 20,
    price: 499,
    summary: 'A test tour for review testing',
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

    // Create a booking first to allow review creation
    await Booking.create({
      tour: tourId,
      user: userId,
      price: 499,
      createdAt: new Date(),
      paid: true,
    });

    const review = await Review.create({
      review: 'Great tour experience!',
      rating: 5,
      tour: tourId,
      user: userId,
    });
    reviewId = review._id;
  });

  describe('GET /api/v1/reviews', () => {
    it('should get all reviews', async () => {
      const response = await request(app)
        .get('/api/v1/reviews')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should populate tour and user data', async () => {
      const response = await request(app)
        .get('/api/v1/reviews')
        .expect(200);

      const review = response.body.data.data[0];
      expect(review.tour).toBeDefined();
      expect(review.user).toBeDefined();
      expect(review.tour.name).toBeDefined();
      expect(review.user.name).toBeDefined();
    });
  });

  describe('GET /api/v1/tours/:tourId/reviews', () => {
    beforeEach(async () => {
      const user2 = await createTestUser({ 
        email: 'user2@example.com',
        name: 'User 2'
      });
      
      // Create booking for user2
      await Booking.create({
        tour: tourId,
        user: user2.user._id,
        price: 499,
        createdAt: new Date(),
        paid: true,
      });
      
      await Review.create({
        review: 'Another great review!',
        rating: 4,
        tour: tourId,
        user: user2.user._id,
      });
    });

    it('should get all reviews for a specific tour', async () => {
      const response = await request(app)
        .get(`/api/v1/tours/${tourId}/reviews`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data.data.every(review => 
        review.tour._id === tourId.toString()
      )).toBe(true);
    });
  });

  describe('GET /api/v1/reviews/:id', () => {
    it('should get a single review by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/${reviewId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data._id).toBe(reviewId.toString());
      expect(response.body.data.data.review).toBe('Great tour experience!');
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/reviews/${fakeId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/tours/:tourId/reviews', () => {
    let user2Token;
    let user2Id;

    beforeEach(async () => {
      const user2 = await createTestUser({ 
        email: 'user2@example.com',
        name: 'User 2'
      });
      user2Token = user2.token;
      user2Id = user2.user._id;

      // Create booking for user2 to allow review creation
      await Booking.create({
        tour: tourId,
        user: user2Id,
        price: 499,
        createdAt: new Date(),
        paid: true,
      });
    });

    it('should create a new review for authenticated user', async () => {
      const reviewData = {
        review: 'Amazing tour! Highly recommend.',
        rating: 5,
      };

      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.review).toBe(reviewData.review);
      expect(response.body.data.data.rating).toBe(reviewData.rating);
      expect(response.body.data.data.tour).toBe(tourId.toString());
      expect(response.body.data.data.user._id).toBe(user2Id.toString());
    });

    it('should return 401 for unauthenticated user', async () => {
      const reviewData = {
        review: 'Amazing tour! Highly recommend.',
        rating: 5,
      };

      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/reviews`)
        .send(reviewData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for invalid rating', async () => {
      const reviewData = {
        review: 'Amazing tour! Highly recommend.',
        rating: 6, // Invalid rating (should be 1-5)
      };

      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for missing required fields', async () => {
      const reviewData = {
        review: 'Amazing tour! Highly recommend.',
        // Missing rating
      };

      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should prevent duplicate reviews from same user on same tour', async () => {
      const reviewData = {
        review: 'Another review from same user',
        rating: 4,
      };

      const response = await request(app)
        .post(`/api/v1/tours/${tourId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/v1/reviews/:id', () => {
    it('should update own review', async () => {
      const updateData = {
        review: 'Updated review text',
        rating: 4,
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.review).toBe(updateData.review);
      expect(response.body.data.data.rating).toBe(updateData.rating);
    });

    it('should allow admin to update any review', async () => {
      const updateData = {
        review: 'Admin updated this review',
        rating: 3,
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.review).toBe(updateData.review);
      expect(response.body.data.data.rating).toBe(updateData.rating);
    });

    it('should return 403 for user trying to update others review', async () => {
      const user2 = await createTestUser({ 
        email: 'user2@example.com',
        name: 'User 2'
      });

      const response = await request(app)
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ review: 'Trying to update others review' })
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/api/v1/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ review: 'Updated review' })
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    it('should delete own review', async () => {
      await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      const deletedReview = await Review.findById(reviewId);
      expect(deletedReview).toBeNull();
    });

    it('should allow admin to delete any review', async () => {
      await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedReview = await Review.findById(reviewId);
      expect(deletedReview).toBeNull();
    });

    it('should return 403 for user trying to delete others review', async () => {
      const user2 = await createTestUser({ 
        email: 'user2@example.com',
        name: 'User 2'
      });

      const response = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});