const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const mongoose = require('mongoose');

// Import test config
require('./config');

// Import models
const User = require('../models/User');

// Import test helper
const dbHelper = require('./mockMongoMemoryServer');

// Import server
const server = require('../server');

chai.use(chaiHttp);

describe('Auth Controller Tests', function() {
  let testUser;
  
  before(async function() {
    // Connect to test database
    try {
      await dbHelper.connect();
    } catch (err) {
      console.error('Error connecting to test database:', err);
    }
  });
  
  beforeEach(async function() {
    // Clear database before each test
    await dbHelper.clearDatabase();
    
    // Create a test user
    testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };
  });
  
  after(async function() {
    // Close database connection after all tests
    await dbHelper.closeDatabase();
  });
  
  describe('POST /api/auth/register', function() {
    it('should register a new user', async function() {
      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('name', testUser.name);
      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.have.property('role', testUser.role);
      expect(res.body.user).to.not.have.property('password');
    });
    
    it('should not register a user with an existing email', async function() {
      // First create a user
      await User.create(testUser);
      
      // Try to create another user with the same email
      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User already exists');
    });
  });
  
  describe('POST /api/auth/login', function() {
    beforeEach(async function() {
      // Create a user for login tests
      await User.create(testUser);
    });
    
    it('should login a user with valid credentials', async function() {
      const res = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('name', testUser.name);
      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.not.have.property('password');
    });
    
    it('should not login a user with invalid email', async function() {
      const res = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        });
      
      expect(res).to.have.status(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });
    
    it('should not login a user with invalid password', async function() {
      const res = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res).to.have.status(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });
  });
  
  describe('GET /api/auth/me', function() {
    let token;
    
    beforeEach(async function() {
      // Create a user and get token
      const user = await User.create(testUser);
      token = require('jsonwebtoken').sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });
    
    it('should get current user profile with valid token', async function() {
      const res = await chai.request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('name', testUser.name);
      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.not.have.property('password');
    });
    
    it('should not get user profile without token', async function() {
      const res = await chai.request(server)
        .get('/api/auth/me');
      
      expect(res).to.have.status(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Not authorized to access this route');
    });
    
    it('should not get user profile with invalid token', async function() {
      const res = await chai.request(server)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res).to.have.status(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Not authorized to access this route');
    });
  });
});
