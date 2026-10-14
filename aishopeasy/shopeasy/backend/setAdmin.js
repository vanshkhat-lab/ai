import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";

dotenv.config();

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run make-admin -- <account-email>");
  process.exitCode = 1;
} else {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error("Could not connect to MongoDB.");
    }

    const result = await User.updateOne(
      { email },
      { $set: { role: "admin" } }
    );

    if (result.matchedCount === 0) {
      throw new Error(`No account found for ${email}. Register it first.`);
    }

    console.log(`Admin access granted to ${email}. Sign in again to apply it.`);
  } catch (error) {
    console.error(`Could not grant admin access: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
