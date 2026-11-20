
import test from "node:test";
import assert from "node:assert/strict";

import {
  getDestinationAccessibility
} from "../controllers/accessibilityController.js";

import Location from "../models/Location.js";

// Mock Express response, following the team's existing test style.
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

// Replace the MongoDB query temporarily for each test.
async function withMockLocation(findLocation, runTest) {
  const originalFindOne = Location.findOne;

  try {
    Location.findOne = (filter) => ({
      async lean() {
        return findLocation(filter);
      }
    });

    await runTest();
  } finally {
    Location.findOne = originalFindOne;
  }
}

const sampleLocation = {
  locationId: "b-hub",
  name: "Student HUB",
  accessibility: {
    elevator: true,
    washroom: true,
    ramp: true,
    autoDoor: false
  }
};

// Test 1: Retrieve accessibility details from a mocked database query.
test("Story 4 retrieves destination accessibility details", async () => {
  await withMockLocation(
    (filter) => {
      assert.equal(filter.locationId, "b-hub");
      return sampleLocation;
    },
    async () => {
      const res = mockResponse();

      await getDestinationAccessibility(
        { params: { placeId: "b-hub" } },
        res
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.location.id, "b-hub");
      assert.equal(res.body.location.name, "Student HUB");
      assert.equal(res.body.features.length, 4);
      assert.equal(res.body.availableCount, 3);
      assert.equal(res.body.total, 4);
    }
  );
});

// Test 2: Verify available and unavailable features.
test("Story 4 returns correct accessibility features", async () => {
  await withMockLocation(
    () => sampleLocation,
    async () => {
      const res = mockResponse();

      await getDestinationAccessibility(
        { params: { placeId: "b-hub" } },
        res
      );

      const features = res.body.features;

      assert.equal(
        features.find((item) => item.id === "elevator").available,
        true
      );

      assert.equal(
        features.find((item) => item.id === "washroom").available,
        true
      );

      assert.equal(
        features.find((item) => item.id === "ramp").available,
        true
      );

      assert.equal(
        features.find((item) => item.id === "autoDoor").available,
        false
      );
    }
  );
});

// Test 3: Retrieve a different destination.
test("Story 4 retrieves another destination", async () => {
  const secondLocation = {
    locationId: "b-b210",
    name: "Room B210",
    accessibility: {
      elevator: true,
      washroom: false,
      ramp: false,
      autoDoor: false
    }
  };

  await withMockLocation(
    (filter) => {
      assert.equal(filter.locationId, "b-b210");
      return secondLocation;
    },
    async () => {
      const res = mockResponse();

      await getDestinationAccessibility(
        { params: { placeId: "b-b210" } },
        res
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.location.name, "Room B210");
      assert.equal(res.body.availableCount, 1);
      assert.equal(res.body.total, 4);
    }
  );
});

// Test 4: Return 404 when MongoDB has no matching destination.
test("Story 4 rejects an unknown destination", async () => {
  await withMockLocation(
    () => null,
    async () => {
      const res = mockResponse();

      await getDestinationAccessibility(
        { params: { placeId: "unknown" } },
        res
      );

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(
        res.body.message,
        "That place is not in the campus records."
      );
    }
  );
});

// Test 5: Reject a missing destination ID.
test("Story 4 rejects a missing destination ID", async () => {
  const res = mockResponse();

  await getDestinationAccessibility(
    { params: {} },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(
    res.body.message,
    "A destination ID is required"
  );
});

// Test 6: Handle MongoDB query failures.
test("Story 4 handles database errors", async () => {
  const originalFindOne = Location.findOne;
  const originalConsoleError = console.error;

  try {
    Location.findOne = () => ({
      async lean() {
        throw new Error("Database unavailable");
      }
    });

    // Suppress expected error output during the test.
    console.error = () => {};

    const res = mockResponse();

    await getDestinationAccessibility(
      { params: { placeId: "b-hub" } },
      res
    );

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(
      res.body.message,
      "Unable to retrieve destination accessibility details"
    );
  } finally {
    Location.findOne = originalFindOne;
    console.error = originalConsoleError;
  }
});
