import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/family_todo";
  try {
    await mongoose.connect(uri);
    console.log(`[db] MongoDB connected -> ${uri}`);
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    process.exit(1);
  }
};
