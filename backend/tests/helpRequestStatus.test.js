
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import {
  updateHelpRequestStatus
} from "../controllers/helpRequestStatusController.js";

const requestId = new mongoose.Types.ObjectId().toString();

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

// Test 1: Accepted -> On the Way
test("Story 10 changes Accepted to On the Way", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;

  try {
    HelpRequest.findOneAndUpdate = async (filter, update, options) => {
      assert.equal(filter._id, requestId);
      assert.equal(filter.status, "Accepted");
      assert.deepEqual(filter.helperId, { $ne: null });
      assert.equal(update.$set.status, "On the Way");
      assert.equal(options.runValidators, true);

      return {
        _id: requestId,
        status: "On the Way"
      };
    };

    const res = mockResponse();

    await updateHelpRequestStatus(
      {
        params: { id: requestId },
        body: { status: "On the Way" }
      },
      res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.request.status, "On the Way");

  } finally {
    HelpRequest.findOneAndUpdate = originalUpdate;
  }
});

// Test 2: On the Way -> Completed
test("Story 10 changes On the Way to Completed", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;

  try {
    HelpRequest.findOneAndUpdate = async (filter, update) => {
      assert.equal(filter.status, "On the Way");
      assert.equal(update.$set.status, "Completed");

      return {
        _id: requestId,
        status: "Completed"
      };
    };

    const res = mockResponse();

    await updateHelpRequestStatus(
      {
        params: { id: requestId },
        body: { status: "Completed" }
      },
      res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.request.status, "Completed");

  } finally {
    HelpRequest.findOneAndUpdate = originalUpdate;
  }
});

// Test 3: Reject invalid status
test("Story 10 rejects invalid status transitions", async () => {
  const res = mockResponse();

  await updateHelpRequestStatus(
    {
      params: { id: requestId },
      body: { status: "Pending" }
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

// Test 4: Reject invalid request ID
test("Story 10 rejects invalid request IDs", async () => {
  const res = mockResponse();

  await updateHelpRequestStatus(
    {
      params: { id: "invalid-id" },
      body: { status: "Completed" }
    },
    res
  );

  assert.equal(res.statusCode, 400);
});

// Test 5: Reject unavailable transitions
test("Story 10 rejects unavailable transitions", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;

  try {
    HelpRequest.findOneAndUpdate = async () => null;

    const res = mockResponse();

    await updateHelpRequestStatus(
      {
        params: { id: requestId },
        body: { status: "Completed" }
      },
      res
    );

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);

  } finally {
    HelpRequest.findOneAndUpdate = originalUpdate;
  }
});

// Test 6: Handle database errors
test("Story 10 handles database errors", async () => {
  const originalUpdate = HelpRequest.findOneAndUpdate;
  const originalConsoleError = console.error;

  try {
    HelpRequest.findOneAndUpdate = async () => {
      throw new Error("Database unavailable");
    };

    console.error = () => {};

    const res = mockResponse();

    await updateHelpRequestStatus(
      {
        params: { id: requestId },
        body: { status: "On the Way" }
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
