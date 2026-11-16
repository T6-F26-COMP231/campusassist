
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import { acceptHelpRequest } from "../controllers/helpRequestController.js";

// Sample MongoDB IDs for testing
const requestId = new mongoose.Types.ObjectId().toString();
const helperId = new mongoose.Types.ObjectId().toString();

// Mock Express response
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

// TEST 1: Accept a pending request
test("Story 18 accepts a pending help request", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;

  try {
    HelpRequest.findOneAndUpdate = async (
      filter, update, options
    ) => {
      assert.equal(filter._id, requestId);
      assert.equal(filter.status, "Pending");
      assert.equal(filter.helperId, null);

      assert.equal(update.$set.status, "Accepted");
      assert.equal(update.$set.helperId, helperId);
      assert.equal(options.new, true);

      return {
        _id: requestId,
        status: "Accepted",
        helperId
      };
    };

    const res = mockResponse();

    await acceptHelpRequest(
      {
        params: { id: requestId },
        body: { helperId }
      },
      res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.request.status, "Accepted");
    assert.equal(res.body.request.helperId, helperId);

  } finally {
    HelpRequest.findOneAndUpdate = originalUpdate;
  }
});

// TEST 2: Prevent accepting an unavailable request
test("Story 18 prevents duplicate acceptance", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;

  try {
    HelpRequest.findOneAndUpdate = async () => null;

    const res = mockResponse();

    await acceptHelpRequest(
      {
        params: { id: requestId },
        body: { helperId }
      },
      res
    );

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);

  } finally {
    HelpRequest.findOneAndUpdate = originalUpdate;
  }
});

// TEST 3: Reject invalid request IDs
test("Story 18 rejects invalid IDs", async () => {
  const res = mockResponse();

  await acceptHelpRequest(
    {
      params: { id: "invalid-id" },
      body: { helperId }
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

// TEST 4: Handle database errors
test("Story 18 handles database errors", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;
  const originalConsoleError = console.error;

  try {
    HelpRequest.findOneAndUpdate = async () => {
      throw new Error("Database unavailable");
    };

    console.error = () => {};

    const res = mockResponse();

    await acceptHelpRequest(
      {
        params: { id: requestId },
        body: { helperId }
      },
      res
    );

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);

  } finally {
    HelpRequest.findOneAndUpdate = originalUpdate;
    console.error = originalConsoleError;
  }
});
