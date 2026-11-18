
import "dotenv/config";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import { acceptHelpRequest } from "../controllers/helpRequestController.js";

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

let testRequestId = null;

async function runTest() {
  if (
    !process.env.MONGODB_URI ||
    process.env.MONGODB_DB_NAME !== "campusassist_test"
  ) {
    throw new Error("Use the campusassist_test database");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "campusassist_test"
  });

  console.log("Connected to MongoDB Atlas");

  // Create one test request.
  const request = await HelpRequest.create({
    currentLocation: "B Block, Floor 1",
    description: "Need assistance finding classroom B101",
    assistanceType: "Standard Guiding"
  });

  testRequestId = request._id;

  assert.equal(request.status, "Pending");
  assert.equal(request.helperId, null);

  console.log("Test request created with Pending status");

  // Generate two different helper IDs.
  const helper1 = new mongoose.Types.ObjectId();
  const helper2 = new mongoose.Types.ObjectId();

  // First helper accepts the request.
  const firstResponse = mockResponse();

  await acceptHelpRequest(
    {
      params: { id: String(testRequestId) },
      body: { helperId: String(helper1) }
    },
    firstResponse
  );

  assert.equal(firstResponse.statusCode, 200);

  // Verify the actual saved MongoDB document.
  const savedRequest = await HelpRequest.findById(
    testRequestId
  );

  assert.equal(savedRequest.status, "Accepted");
  assert.equal(String(savedRequest.helperId), String(helper1));

  console.log("Request accepted successfully!");
  console.log("Status saved:", savedRequest.status);
  console.log("Helper ID saved correctly!");

  // Second helper attempts to accept the same request.
  const secondResponse = mockResponse();

  await acceptHelpRequest(
    {
      params: { id: String(testRequestId) },
      body: { helperId: String(helper2) }
    },
    secondResponse
  );

  assert.equal(secondResponse.statusCode, 409);

  // Confirm the original helper is still assigned.
  const finalRequest = await HelpRequest.findById(
    testRequestId
  );

  assert.equal(finalRequest.status, "Accepted");
  assert.equal(String(finalRequest.helperId), String(helper1));

  console.log("Duplicate acceptance prevented!");
  console.log("Story 18 Atlas test passed!");
}

try {
  await runTest();
} catch (error) {
  console.error("Story 18 test failed:", error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState === 1) {
    if (testRequestId) {
      await HelpRequest.deleteOne({
        _id: testRequestId
      });

      console.log("Test record cleaned up");
    }

    await mongoose.disconnect();
  }
}
