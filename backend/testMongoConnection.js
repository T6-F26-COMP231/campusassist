
import "dotenv/config";
import mongoose from "mongoose";
import HelpRequest from "./models/HelpRequest.js";

async function testMongoConnection() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri || dbName !== "campusassist_test") {
    throw new Error(
      "Configure the campusassist_test database in .env"
    );
  }

  console.log("Connecting to MongoDB Atlas...");

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000
  });

  console.log("Connected successfully!");

  // Create a test help request.
  const request = await HelpRequest.create({
    currentLocation: "a3-74",
    description: "by the washroom",
    assistanceType: "Standard Guiding"
  });

  console.log("Help request saved!");
  console.log("Request ID:", request._id.toString());
  console.log("Status:", request.status);

  // Retrieve the request from MongoDB.
  const savedRequest = await HelpRequest.findById(
    request._id
  );

  if (!savedRequest) {
    throw new Error(
      "Help request was not found in MongoDB."
    );
  }

  console.log("Help request retrieved!");
  console.log(
    "Location:",
    savedRequest.currentLocation
  );
  console.log(
    "Assistance Type:",
    savedRequest.assistanceType
  );

  // Delete only the record created by this test.
  await HelpRequest.deleteOne({ _id: request._id });

  console.log("Test record cleaned up.");
  console.log("MongoDB test completed successfully!");
}

try {
  await testMongoConnection();
} catch (error) {
  console.error("Test failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
