
import test from "node:test";
import assert from "node:assert/strict";
import { getPendingRequests } from "../controllers/helpRequestController.js";
import HelpRequest from "../models/HelpRequest.js";

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

test("Story 17 retrieves pending requests in B Block", async () => {
  const originalFind = HelpRequest.find;

  const sampleRequests = [
    {
      currentLocation: "B Block, Floor 1",
      description: "Needs help with classroom door",
      status: "Pending"
    }
  ];

  try {
    HelpRequest.find = (filter) => {
      assert.equal(filter.status, "Pending");
      assert.equal(filter.helperId, null);
      assert.ok(filter.currentLocation instanceof RegExp);

      assert.equal(
        filter.currentLocation.test("B Block, Floor 1"),
        true
      );

      assert.equal(
        filter.currentLocation.test("A Block, Floor 2"),
        false
      );

      return {
        select() { return this; },
        sort() { return this; },
        async lean() { return sampleRequests; }
      };
    };

    const res = mockResponse();

    await getPendingRequests(
      { query: { block: "B" } },
      res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.block, "B");
    assert.equal(res.body.count, 1);
    assert.deepEqual(res.body.requests, sampleRequests);
  } finally {
    HelpRequest.find = originalFind;
  }
});

test("Story 17 rejects an invalid block", async () => {
  const res = mockResponse();

  await getPendingRequests(
    { query: { block: "D" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("Story 17 handles database errors", async () => {
  const originalFind = HelpRequest.find;
  const originalConsoleError = console.error;

  try {
    HelpRequest.find = () => {
      throw new Error("Database unavailable");
    };

    console.error = () => {};

    const res = mockResponse();

    await getPendingRequests(
      { query: { block: "B" } },
      res
    );

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
  } finally {
    HelpRequest.find = originalFind;
    console.error = originalConsoleError;
  }
});
