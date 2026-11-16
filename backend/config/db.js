
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri || !dbName) {
    throw new Error(
      "MONGODB_URI and MONGODB_DB_NAME are required"
    );
  }

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB connected successfully");
}
