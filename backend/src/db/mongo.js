const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);  // Stop server on failure
  }
};

module.exports = connectDB;
