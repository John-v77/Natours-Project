const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  // Increase timeout for MongoDB Memory Server startup
  jest.setTimeout(60000);

  try {
    // Create in-memory MongoDB instance with explicit configuration
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 0, // Let it pick a random available port
        dbName: 'natours-test',
      },
      binary: {
        downloadDir: './node_modules/.cache/mongodb-memory-server/mongodb-binaries',
        version: '5.0.0',
      },
    });

    const mongoUri = mongoServer.getUri();
    console.log(`Test MongoDB URI: ${mongoUri}`);

    // Close existing connections if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Failed to start test database:', error);
    throw error;
  }
}, 60000);

beforeEach(async () => {
  // Clean up database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  try {
    // Close connection and stop MongoDB instance
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
}, 30000);

// Suppress console.log during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};