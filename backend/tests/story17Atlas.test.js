
import "dotenv/config";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import { getPendingRequests } from "../controllers/helpRequestController.js";

const dbName = process.env.MONGODB_DB_NAME;

if (!process.env.MONGODB_URI || dbName !== "campusassist_test") {
  throw new Error("Use the campusassist_test database");
}

let testIds = [];

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName
  });

  console.log("Connected to MongoDB Atlas");

  const samples = await HelpRequest.insertMany([
    {
      currentLocation: "B Block, Floor 1",
      description: "Need help with classroom door",
      status: "Pending"
    },
    {
      currentLocation: "A Block, Floor 2",
      description: "Need help finding a classroom",
      status: "Pending"
    },
    {
      currentLocation: "B Block, Floor 2",
      description: "Request already accepted",
      status: "Accepted"
    }
  ]);

  testIds = samples.map(item => item._id);

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };

  await getPendingRequests(
    { query: { block: "B" } },
    res
  );

  if (res.statusCode !== 200) {
    throw new Error("Request retrieval failed");
  }

  const matchingSamples = res.body.requests.filter(
    request => testIds.some(
      id => String(id) === String(request._id)
    )
  );

  if (
    matchingSamples.length !== 1 ||
    matchingSamples[0].currentLocation !== "B Block, Floor 1"
  ) {
    throw new Error("Nearby filtering test failed");
  }

  console.log("Story 17 Atlas test passed!");
  console.log("Only the pending B Block sample was returned.");

} catch (error) {
  console.error("Test failed:", error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState === 1) {
    if (testIds.length) {
      await HelpRequest.deleteMany({
        _id: { $in: testIds }
      });
      console.log("Test records cleaned up");
    }

    await mongoose.disconnect();
  }
}
