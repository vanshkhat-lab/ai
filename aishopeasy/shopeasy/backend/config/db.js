import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    console.log("Using database:", mongoose.connection.name);
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
  }
};

export default connectDB;
