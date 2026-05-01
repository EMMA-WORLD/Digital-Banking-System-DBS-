// Database module: creates the MongoDB connection.
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect once during server startup.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;