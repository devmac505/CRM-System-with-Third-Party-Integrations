const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const mongoose = require('mongoose');

// Import test config
require('./config');

// Import models
const User = require('../models/User');
const Customer = require('../models/Customer');

// Import test helper
const dbHelper = require('./mockMongoMemoryServer');

// Import server
const server = require('../server');

chai.use(chaiHttp);

describe('Customer Controller Tests', function() {
  let testUser;
  let testCustomer;
  let token;
  let adminToken;
  
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
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    // Create an admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Generate tokens
    token = require('jsonwebtoken').sign(
      { id: testUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = require('jsonwebtoken').sign(
      { id: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Create a test customer
    testCustomer = {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '123-456-7890',
      company: 'Test Company',
      status: 'active',
      assignedTo: testUser._id
    };
  });
  
  after(async function() {
    // Close database connection after all tests
    await dbHelper.closeDatabase();
  });
  
  describe('GET /api/customers', function() {
    it('should get all customers', async function() {
      // Create some customers
      await Customer.create(testCustomer);
      await Customer.create({
        ...testCustomer,
        name: 'Another Customer',
        email: 'another@example.com'
      });
      
      const res = await chai.request(server)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('count', 2);
      expect(res.body).to.have.property('data').to.be.an('array').with.lengthOf(2);
    });
    
    it('should not get customers without authentication', async function() {
      const res = await chai.request(server)
        .get('/api/customers');
      
      expect(res).to.have.status(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Not authorized to access this route');
    });
  });
  
  describe('GET /api/customers/:id', function() {
    it('should get a customer by ID', async function() {
      // Create a customer
      const customer = await Customer.create(testCustomer);
      
      const res = await chai.request(server)
        .get(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('name', testCustomer.name);
      expect(res.body.data).to.have.property('email', testCustomer.email);
    });
    
    it('should return 404 for non-existent customer', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await chai.request(server)
        .get(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Customer not found');
    });
  });
  
  describe('POST /api/customers', function() {
    it('should create a new customer', async function() {
      const res = await chai.request(server)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(testCustomer);
      
      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('name', testCustomer.name);
      expect(res.body.data).to.have.property('email', testCustomer.email);
      expect(res.body.data).to.have.property('phone', testCustomer.phone);
    });
  });
  
  describe('PUT /api/customers/:id', function() {
    it('should update a customer', async function() {
      // Create a customer
      const customer = await Customer.create(testCustomer);
      
      const updatedData = {
        name: 'Updated Customer',
        email: 'updated@example.com'
      };
      
      const res = await chai.request(server)
        .put(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('name', updatedData.name);
      expect(res.body.data).to.have.property('email', updatedData.email);
      expect(res.body.data).to.have.property('phone', testCustomer.phone); // Unchanged field
    });
    
    it('should return 404 for updating non-existent customer', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await chai.request(server)
        .put(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      
      expect(res).to.have.status(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Customer not found');
    });
  });
  
  describe('DELETE /api/customers/:id', function() {
    it('should delete a customer as admin', async function() {
      // Create a customer
      const customer = await Customer.create(testCustomer);
      
      const res = await chai.request(server)
        .delete(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      
      // Verify customer is deleted
      const deletedCustomer = await Customer.findById(customer._id);
      expect(deletedCustomer).to.be.null;
    });
    
    it('should not allow regular user to delete a customer', async function() {
      // Create a customer
      const customer = await Customer.create(testCustomer);
      
      const res = await chai.request(server)
        .delete(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(403);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('not authorized');
    });
  });
});
