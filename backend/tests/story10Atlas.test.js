
import "dotenv/config";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import { updateHelpRequestStatus } from "../controllers/helpRequestStatusController.js";

let testRequestId = null;

function mockResponse() {
  return {
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
}

async function main() {
  if (
    !process.env.MONGODB_URI ||
    process.env.MONGODB_DB_NAME !== "campusassist_test"
  ) {
    throw new Error("Use campusassist_test only");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "campusassist_test"
  });

  console.log("Connected to MongoDB Atlas");

  const helperId = new mongoose.Types.ObjectId();

  // Create a test request already accepted by a helper
  const request = await HelpRequest.create({
    currentLocation: "B Block, Floor 2",
    description: "STORY 10 TEST - Need help finding bookstore",
    assistanceType: "Standard Guiding",
    status: "Accepted",
    helperId
  });

  testRequestId = request._id;

  console.log("Initial status:", request.status);

  // Test Accepted -> On the Way
  const onWayResponse = mockResponse();

  await updateHelpRequestStatus(
    {
      params: { id: String(testRequestId) },
      body: { status: "On the Way" }
    },
    onWayResponse
  );

  assert.equal(onWayResponse.statusCode, 200);

  let saved = await HelpRequest.findById(testRequestId);
  assert.equal(saved.status, "On the Way");

  console.log("Status updated:", saved.status);

  // Test On the Way -> Completed
  const completedResponse = mockResponse();

  await updateHelpRequestStatus(
    {
      params: { id: String(testRequestId) },
      body: { status: "Completed" }
    },
    completedResponse
  );

  assert.equal(completedResponse.statusCode, 200);

  saved = await HelpRequest.findById(testRequestId);
  assert.equal(saved.status, "Completed");
  assert.equal(String(saved.helperId), String(helperId));

  console.log("Final status:", saved.status);
  console.log("Assigned helper preserved!");
  console.log("Story 10 Atlas test passed!");
}

try {
  await main();
} catch (error) {
  console.error("Test failed:", error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState === 1) {
    try {
      if (testRequestId) {
        await HelpRequest.deleteOne({ _id: testRequestId });
        console.log("Test record cleaned up");
      }
    } finally {
      await mongoose.disconnect();
    }
  }
}
