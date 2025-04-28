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
const Lead = require('../models/Lead');

// Import test helper
const dbHelper = require('./mockMongoMemoryServer');

// Import server
const server = require('../server');

chai.use(chaiHttp);

describe('Lead Controller Tests', function() {
  let testUser;
  let testCustomer;
  let testLead;
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
    testCustomer = await Customer.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '123-456-7890',
      company: 'Test Company',
      status: 'lead',
      assignedTo: testUser._id
    });
    
    // Create a test lead
    testLead = {
      customer: testCustomer._id,
      source: 'website',
      status: 'new',
      score: 50,
      value: 1000,
      expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      assignedTo: testUser._id,
      notes: 'Test lead notes'
    };
  });
  
  after(async function() {
    // Close database connection after all tests
    await dbHelper.closeDatabase();
  });
  
  describe('GET /api/leads', function() {
    it('should get all leads', async function() {
      // Create some leads
      await Lead.create(testLead);
      await Lead.create({
        ...testLead,
        status: 'qualified',
        score: 75
      });
      
      const res = await chai.request(server)
        .get('/api/leads')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('count', 2);
      expect(res.body).to.have.property('data').to.be.an('array').with.lengthOf(2);
    });
    
    it('should not get leads without authentication', async function() {
      const res = await chai.request(server)
        .get('/api/leads');
      
      expect(res).to.have.status(401);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Not authorized to access this route');
    });
  });
  
  describe('GET /api/leads/:id', function() {
    it('should get a lead by ID', async function() {
      // Create a lead
      const lead = await Lead.create(testLead);
      
      const res = await chai.request(server)
        .get(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('status', testLead.status);
      expect(res.body.data).to.have.property('score', testLead.score);
    });
    
    it('should return 404 for non-existent lead', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await chai.request(server)
        .get(`/api/leads/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Lead not found');
    });
  });
  
  describe('POST /api/leads', function() {
    it('should create a new lead', async function() {
      const res = await chai.request(server)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send(testLead);
      
      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('status', testLead.status);
      expect(res.body.data).to.have.property('score', testLead.score);
      expect(res.body.data).to.have.property('value', testLead.value);
    });
  });
  
  describe('PUT /api/leads/:id', function() {
    it('should update a lead', async function() {
      // Create a lead
      const lead = await Lead.create(testLead);
      
      const updatedData = {
        status: 'qualified',
        score: 75,
        notes: 'Updated notes'
      };
      
      const res = await chai.request(server)
        .put(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('status', updatedData.status);
      expect(res.body.data).to.have.property('score', updatedData.score);
      expect(res.body.data).to.have.property('notes', updatedData.notes);
      expect(res.body.data).to.have.property('value', testLead.value); // Unchanged field
    });
    
    it('should return 404 for updating non-existent lead', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await chai.request(server)
        .put(`/api/leads/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'qualified' });
      
      expect(res).to.have.status(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Lead not found');
    });
  });
  
  describe('DELETE /api/leads/:id', function() {
    it('should delete a lead as admin', async function() {
      // Create a lead
      const lead = await Lead.create(testLead);
      
      const res = await chai.request(server)
        .delete(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      
      // Verify lead is deleted
      const deletedLead = await Lead.findById(lead._id);
      expect(deletedLead).to.be.null;
    });
    
    it('should not allow regular user to delete a lead', async function() {
      // Create a lead
      const lead = await Lead.create(testLead);
      
      const res = await chai.request(server)
        .delete(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res).to.have.status(403);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('not authorized');
    });
  });
  
  describe('POST /api/leads/:id/interactions', function() {
    it('should add an interaction to a lead', async function() {
      // Create a lead
      const lead = await Lead.create(testLead);
      
      const interaction = {
        type: 'call',
        notes: 'Discussed product features',
        outcome: 'Positive response'
      };
      
      const res = await chai.request(server)
        .post(`/api/leads/${lead._id}/interactions`)
        .set('Authorization', `Bearer ${token}`)
        .send(interaction);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data.interactions).to.be.an('array').with.lengthOf(1);
      expect(res.body.data.interactions[0]).to.have.property('type', interaction.type);
      expect(res.body.data.interactions[0]).to.have.property('notes', interaction.notes);
      expect(res.body.data.interactions[0]).to.have.property('outcome', interaction.outcome);
    });
    
    it('should return 404 for adding interaction to non-existent lead', async function() {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const interaction = {
        type: 'call',
        notes: 'Discussed product features',
        outcome: 'Positive response'
      };
      
      const res = await chai.request(server)
        .post(`/api/leads/${nonExistentId}/interactions`)
        .set('Authorization', `Bearer ${token}`)
        .send(interaction);
      
      expect(res).to.have.status(404);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Lead not found');
    });
  });
});
