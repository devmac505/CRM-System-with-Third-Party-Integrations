const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to the in-memory database
module.exports.connect = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoUri, mongooseOpts);
    console.log('Connected to in-memory MongoDB');
  } catch (error) {
    console.error('Error connecting to in-memory MongoDB:', error);
    throw error;
  }
};

// Disconnect and close connection
module.exports.closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('Closed in-memory MongoDB connection');
  } catch (error) {
    console.error('Error closing in-memory MongoDB connection:', error);
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
    console.log('Cleared in-memory MongoDB data');
  } catch (error) {
    console.error('Error clearing in-memory MongoDB data:', error);
    throw error;
  }
};
