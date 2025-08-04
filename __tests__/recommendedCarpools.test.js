const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the authentication middleware to simply attach a test email
jest.mock('../utils/authUtils', () => ({
  authenticateToken: (req, res, next) => {
    req.email = 'test@example.com';
    next();
  }
}));

const apiRoutes = require('../routes/apiRoutes');
const Carpool = require('../schemas/Carpool.model');
const UserSettings = require('../schemas/UserSettings.model');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

beforeEach(async () => {
  app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  await Carpool.deleteMany({});
  await UserSettings.deleteMany({});
});

test('recommended carpools endpoint returns 404 since interests system was removed', async () => {
  await UserSettings.create({ userEmail: 'test@example.com' });

  await Carpool.create([
    { seats: 3, userEmail: 'other@example.com', category: 'sports' },
    { seats: 3, userEmail: 'other@example.com', category: 'academic' }
  ]);

  const res = await request(app).get('/api/recommended-carpools');
  expect(res.statusCode).toBe(404);
});
