import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
    console.log(
      `MongoDB connected! DB hostname: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
