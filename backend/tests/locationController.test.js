import test from "node:test";
import assert from "node:assert/strict";
import { searchLocations } from "../controllers/locationController.js";
import Location from "../models/Location.js";

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

// Replace Location.find with a stub that records the filter it was given.
function stubFind(results) {
  const calls = [];
  Location.find = (filter) => {
    calls.push(filter);
    return {
      select() { return this; },
      sort() { return this; },
      lean: async () => results
    };
  };
  return calls;
}

test("Story 2 searches locations by partial name, ignoring case", async () => {
  const originalFind = Location.find;

  try {
    const sample = [
      { _id: "1", locationId: "student-hub", name: "Student HUB", block: "C", floor: 2 }
    ];
    const calls = stubFind(sample);
    const res = mockResponse();

    await searchLocations({ query: { name: "hub" } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.query, "hub");
    assert.equal(res.body.count, 1);
    assert.deepEqual(res.body.locations, sample);
    assert.equal(calls[0].name.$options, "i");
    assert.ok(new RegExp(calls[0].name.$regex, "i").test("Student HUB"));
  } finally {
    Location.find = originalFind;
  }
});

test("Story 2 trims spaces around the search term", async () => {
  const originalFind = Location.find;

  try {
    stubFind([]);
    const res = mockResponse();

    await searchLocations({ query: { name: "   Student   HUB  " } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.query, "Student HUB");
  } finally {
    Location.find = originalFind;
  }
});

test("Story 2 treats special characters as plain text", async () => {
  const originalFind = Location.find;

  try {
    const calls = stubFind([]);
    const res = mockResponse();

    await searchLocations({ query: { name: "B1.03(" } }, res);

    assert.equal(res.statusCode, 200);
    const pattern = new RegExp(calls[0].name.$regex, "i");
    assert.ok(pattern.test("Room B1.03("));
    assert.ok(!pattern.test("Room B1x03("));
  } finally {
    Location.find = originalFind;
  }
});

test("Story 2 returns an empty list when nothing matches", async () => {
  const originalFind = Location.find;

  try {
    stubFind([]);
    const res = mockResponse();

    await searchLocations({ query: { name: "Not A Real Place" } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 0);
    assert.deepEqual(res.body.locations, []);
  } finally {
    Location.find = originalFind;
  }
});

test("Story 2 rejects a missing, blank or repeated name", async () => {
  for (const query of [{}, { name: "" }, { name: "   " }, { name: ["a", "b"] }]) {
    const res = mockResponse();

    await searchLocations({ query }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Enter a location name to search.");
  }
});

test("Story 2 handles database errors", async () => {
  const originalFind = Location.find;
  const originalConsoleError = console.error;

  try {
    Location.find = () => {
      throw new Error("Database unavailable");
    };
    console.error = () => {};
    const res = mockResponse();

    await searchLocations({ query: { name: "hub" } }, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unable to search locations");
  } finally {
    Location.find = originalFind;
    console.error = originalConsoleError;
  }
});