// tests/setup.js
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { logger } = require("../src/middleware/errorHandler");

logger.silent = true;
let mongod;

beforeAll(async () => {
  await mongoose.disconnect();

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
