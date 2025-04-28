// Mock MongoDB Memory Server for testing
const mongoose = require('mongoose');

// Mock MongoDB Memory Server
class MockMongoMemoryServer {
  constructor() {
    this.uri = 'mongodb://localhost:27017/crm-system-test';
  }

  async start() {
    return this;
  }

  async stop() {
    return;
  }

  getUri() {
    return this.uri;
  }
}

// Connect to the test database
module.exports.connect = async () => {
  try {
    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(process.env.MONGO_URI, mongooseOpts);
    console.log('Connected to test MongoDB');
  } catch (error) {
    console.error('Error connecting to test MongoDB:', error);
    throw error;
  }
};

// Disconnect and close connection
module.exports.closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Closed test MongoDB connection');
  } catch (error) {
    console.error('Error closing test MongoDB connection:', error);
    throw error;
  }
};

// Clear all data in the database
module.exports.clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('Cleared test MongoDB data');
  } catch (error) {
    console.error('Error clearing test MongoDB data:', error);
    throw error;
  }
};

module.exports.MongoMemoryServer = MockMongoMemoryServer;
