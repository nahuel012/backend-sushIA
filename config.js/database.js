const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.NODE_ENV === "production"
        ? `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGO_DB}`
        : process.env.MONGODB_URI;

    await mongoose.connect(mongoUri);
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;
