import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";
import { getHelpRequestStatus } from "../controllers/helpRequestStatusController.js";

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

// Replace HelpRequest.findById with a stub that resolves to `result`.
function stubFindById(result) {
  HelpRequest.findById = () => ({
    select() { return this; },
    lean: async () => result
  });
}

test("Story 10 returns the status of an existing request", async () => {
  const originalFindById = HelpRequest.findById;

  try {
    const sample = { _id: requestId, status: "Accepted", assistanceType: "Standard Guiding" };
    stubFindById(sample);
    const res = mockResponse();

    await getHelpRequestStatus({ params: { id: requestId } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.request, sample);
  } finally {
    HelpRequest.findById = originalFindById;
  }
});

test("Story 10 rejects an invalid request ID", async () => {
  const res = mockResponse();

  await getHelpRequestStatus({ params: { id: "not-an-id" } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Invalid help request ID");
});

test("Story 10 returns 404 when the request does not exist", async () => {
  const originalFindById = HelpRequest.findById;

  try {
    stubFindById(null);
    const res = mockResponse();

    await getHelpRequestStatus({ params: { id: requestId } }, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Help request not found");
  } finally {
    HelpRequest.findById = originalFindById;
  }
});

test("Story 10 handles database errors when reading a status", async () => {
  const originalFindById = HelpRequest.findById;
  const originalConsoleError = console.error;

  try {
    HelpRequest.findById = () => {
      throw new Error("Database unavailable");
    };
    console.error = () => {};
    const res = mockResponse();

    await getHelpRequestStatus({ params: { id: requestId } }, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unable to retrieve help request status");
  } finally {
    HelpRequest.findById = originalFindById;
    console.error = originalConsoleError;
  }
});