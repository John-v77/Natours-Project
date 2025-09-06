const request = require('supertest');
const app = require('../../app');
const Tour = require('../../models/tourModel');
const { createTestUser, createAdminUser } = require('../setup/testHelpers');

describe('Tours Endpoints', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const admin = await createAdminUser();
    adminToken = admin.token;
    const user = await createTestUser();
    userToken = user.token;
  });

  const sampleTourData = {
    name: 'Test Tour',
    duration: 5,
    maxGroupSize: 25,
    difficulty: 'easy',
    ratingsAverage: 4.5,
    ratingsQuantity: 20,
    price: 499,
    summary: 'A test tour for automated testing',
    description: 'This is a detailed description of the test tour.',
    imageCover: 'tour-cover.jpg',
    images: ['tour-1.jpg', 'tour-2.jpg'],
    startDates: [new Date('2024-06-01'), new Date('2024-07-01')],
    startLocation: {
      type: 'Point',
      coordinates: [-80.185942, 25.774772],
      address: '301 Biscayne Blvd, Miami, FL 33132, USA',
      description: 'Miami, USA',
    },
    locations: [
      {
        type: 'Point',
        coordinates: [-80.128473, 25.781842],
        address: 'South Beach, Miami Beach, FL, USA',
        description: 'South Beach',
        day: 1,
      },
    ],
  };

  describe('GET /api/v1/tours', () => {
    beforeEach(async () => {
      await Tour.create([
        { ...sampleTourData, name: 'Tour 1' },
        { ...sampleTourData, name: 'Tour 2', price: 699 },
        { ...sampleTourData, name: 'Tour 3', difficulty: 'difficult' },
      ]);
    });

    it('should get all tours', async () => {
      const response = await request(app)
        .get('/api/v1/tours')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(3);
      expect(response.body.data.data).toHaveLength(3);
    });

    it('should filter tours by difficulty', async () => {
      const response = await request(app)
        .get('/api/v1/tours?difficulty=easy')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data.data.every(tour => tour.difficulty === 'easy')).toBe(true);
    });

    it('should filter tours by price range', async () => {
      const response = await request(app)
        .get('/api/v1/tours?price[gte]=500')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(1);
      expect(response.body.data.data[0].price).toBeGreaterThanOrEqual(500);
    });

    it('should sort tours by price', async () => {
      const response = await request(app)
        .get('/api/v1/tours?sort=price')
        .expect(200);

      expect(response.body.status).toBe('success');
      const prices = response.body.data.data.map(tour => tour.price);
      expect(prices).toEqual(prices.slice().sort((a, b) => a - b));
    });

    it('should limit fields in response', async () => {
      const response = await request(app)
        .get('/api/v1/tours?fields=name,price,difficulty')
        .expect(200);

      expect(response.body.status).toBe('success');
      const tour = response.body.data.data[0];
      expect(tour).toHaveProperty('name');
      expect(tour).toHaveProperty('price');
      expect(tour).toHaveProperty('difficulty');
      expect(tour).not.toHaveProperty('description');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/tours?page=1&limit=2')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data.data).toHaveLength(2);
    });
  });

  describe('GET /api/v1/tours/:id', () => {
    let tourId;

    beforeEach(async () => {
      const tour = await Tour.create(sampleTourData);
      tourId = tour._id;
    });

    it('should get a single tour by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/tours/${tourId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data._id).toBe(tourId.toString());
      expect(response.body.data.data.name).toBe(sampleTourData.name);
    });

    it('should return 404 for non-existent tour', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/tours/${fakeId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for invalid tour ID', async () => {
      const response = await request(app)
        .get('/api/v1/tours/invalid-id')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/tours', () => {
    it('should create a new tour as admin', async () => {
      const response = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleTourData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.name).toBe(sampleTourData.name);
      expect(response.body.data.data.slug).toBe('test-tour');
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleTourData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/tours')
        .send(sampleTourData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTourData = { ...sampleTourData };
      delete invalidTourData.name;

      const response = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTourData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/v1/tours/:id', () => {
    let tourId;

    beforeEach(async () => {
      const tour = await Tour.create(sampleTourData);
      tourId = tour._id;
    });

    it('should update a tour as admin', async () => {
      const updateData = {
        name: 'Updated Tour Name',
        price: 599,
      };

      const response = await request(app)
        .patch(`/api/v1/tours/${tourId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.name).toBe(updateData.name);
      expect(response.body.data.data.price).toBe(updateData.price);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .patch(`/api/v1/tours/${tourId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 for non-existent tour', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/api/v1/tours/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/v1/tours/:id', () => {
    let tourId;

    beforeEach(async () => {
      const tour = await Tour.create(sampleTourData);
      tourId = tour._id;
    });

    it('should delete a tour as admin', async () => {
      await request(app)
        .delete(`/api/v1/tours/${tourId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedTour = await Tour.findById(tourId);
      expect(deletedTour).toBeNull();
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .delete(`/api/v1/tours/${tourId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/tours/top-5-cheap', () => {
    beforeEach(async () => {
      await Tour.create([
        { ...sampleTourData, name: 'Cheap Tour 1', price: 200 },
        { ...sampleTourData, name: 'Cheap Tour 2', price: 300 },
        { ...sampleTourData, name: 'Cheap Tour 3', price: 400 },
        { ...sampleTourData, name: 'Expensive Tour 1', price: 1000 },
        { ...sampleTourData, name: 'Expensive Tour 2', price: 1500 },
        { ...sampleTourData, name: 'Expensive Tour 3', price: 2000 },
      ]);
    });

    it('should get top 5 cheap tours', async () => {
      const response = await request(app)
        .get('/api/v1/tours/top-5-cheap')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(5);
      expect(response.body.data.data).toHaveLength(5);
      
      const prices = response.body.data.data.map(tour => tour.price);
      expect(prices).toEqual(prices.slice().sort((a, b) => a - b));
    });
  });

  describe('GET /api/v1/tours/tour-stats', () => {
    beforeEach(async () => {
      await Tour.create([
        { ...sampleTourData, difficulty: 'easy', price: 500, ratingsAverage: 4.5 },
        { ...sampleTourData, difficulty: 'easy', price: 600, ratingsAverage: 4.0 },
        { ...sampleTourData, difficulty: 'medium', price: 800, ratingsAverage: 4.7 },
        { ...sampleTourData, difficulty: 'difficult', price: 1200, ratingsAverage: 4.9 },
      ]);
    });

    it('should get tour statistics', async () => {
      const response = await request(app)
        .get('/api/v1/tours/tour-stats')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.stats).toBeDefined();
      expect(Array.isArray(response.body.data.stats)).toBe(true);
    });
  });
});