import test from "node:test";
import assert from "node:assert/strict";

import { getRoute } from "../controllers/routeController.js";
import { describeStep } from "../services/routeService.js";
import Location from "../models/Location.js";
import BarrierReport from "../models/BarrierReport.js";

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

// Replace the MongoDB lookup temporarily (null = no matching Location record).
function approvedQuery(reports) {
  return {
    select() {
      return this;
    },
    lean: async () => reports
  };
}

async function withLocation(record, runTest) {
  const originalFindOne = Location.findOne;
  const originalFind = BarrierReport.find;

  try {
    Location.findOne = () => ({
      async lean() {
        return record;
      }
    });
    BarrierReport.find = () => approvedQuery([]);

    await runTest();
  } finally {
    Location.findOne = originalFindOne;
    BarrierReport.find = originalFind;
  }
}

async function request(query) {
  const res = mockResponse();
  await getRoute({ query }, res);
  return res;
}

// Map ids used by the Get Directions screen.
const STUDENT_HUB = "1002096928";
const ROOM_A3_74 = "1003098535";
const ROOM_A1_51 = "1002073812";
const GAMING_LOUNGE = "1002074269"; // on the map, but no walkable route from the hub

// Test 1: A valid route returns numbered, structured steps.
test("Story 6 returns ordered step-by-step directions between two places", async () => {
  await withLocation(null, async () => {
    const res = await request({ from: STUDENT_HUB, to: ROOM_A3_74 });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.from.name, "Student Hub");
    assert.equal(res.body.to.name, "A3-74");
    assert.equal(res.body.alreadyAtDestination, false);
    assert.equal(res.body.totalSteps, res.body.steps.length);
    assert.ok(res.body.totalSteps >= 3);
    assert.deepEqual(
      res.body.steps.map((step) => step.step),
      res.body.steps.map((_, index) => index + 1)
    );
    assert.equal(res.body.steps[0].type, "start");
    assert.equal(res.body.steps.at(-1).type, "arrive");
    assert.equal(res.body.steps.at(-1).instruction, "Arrive at A3-74");
    assert.ok(res.body.totalMetres > 0);
    assert.ok(res.body.minutes >= 1);
    assert.deepEqual(res.body.floors, ["2", "3"]);
  });
});

// Test 2: Places can be given by name or room code, not only by map id.
test("Story 6 accepts a place name or room code", async () => {
  await withLocation(null, async () => {
    const byName = await request({ from: "student hub", to: ROOM_A3_74 });
    const byCode = await request({ from: "B2-02", to: "A3-74" });

    assert.equal(byName.statusCode, 200);
    assert.equal(byName.body.from.id, STUDENT_HUB);
    assert.equal(byCode.statusCode, 200);
    assert.equal(byCode.body.from.name, "Bookstore (B2-02)");
    assert.equal(byCode.body.to.id, ROOM_A3_74);
  });
});

// Test 3: A saved Location record (Story 2 search result) can be used as a place.
test("Story 6 accepts the locationId of an existing Location record", async () => {
  await withLocation({ locationId: "student-hub", name: "Student HUB" }, async () => {
    const res = await request({ from: "student-hub", to: ROOM_A3_74 });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.from.id, STUDENT_HUB);
  });
});

// Test 4: Avoiding stairs gives a step-free route with an elevator ride.
test("Story 6 avoids stairs when asked", async () => {
  await withLocation(null, async () => {
    const res = await request({
      from: ROOM_A1_51,
      to: ROOM_A3_74,
      avoidStairs: "true"
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.stepFree, true);
    assert.equal(res.body.usesStairs, false);
    assert.equal(res.body.steps.some((step) => step.type === "stairs"), false);

    const ride = res.body.steps.find((step) => step.type === "elevator");
    assert.deepEqual([ride.fromFloor, ride.toFloor], ["1", "3"]);
  });
});

// Test 5: Same start and destination is a clear, empty success.
test("Story 6 reports when the start and destination are the same place", async () => {
  await withLocation(null, async () => {
    const res = await request({ from: STUDENT_HUB, to: "Student Hub" });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.alreadyAtDestination, true);
    assert.equal(res.body.message, "You are already at your destination");
    assert.deepEqual(res.body.steps, []);
    assert.equal(res.body.totalSteps, 0);
  });
});

// Test 6: Missing or empty locations are rejected.
test("Story 6 rejects a missing or empty start or destination", async () => {
  const noFrom = await request({ to: STUDENT_HUB });
  const emptyFrom = await request({ from: "   ", to: STUDENT_HUB });
  const noTo = await request({ from: STUDENT_HUB });
  const repeated = await request({ from: [STUDENT_HUB, ROOM_A3_74], to: STUDENT_HUB });

  assert.equal(noFrom.statusCode, 400);
  assert.equal(noFrom.body.message, "A start location (from) is required");
  assert.equal(emptyFrom.statusCode, 400);
  assert.equal(noTo.statusCode, 400);
  assert.equal(noTo.body.message, "A destination (to) is required");
  assert.equal(repeated.statusCode, 400);
});

// Test 7: An unrecognised avoidStairs value is rejected.
test("Story 6 rejects an invalid avoidStairs value", async () => {
  const res = await request({ from: STUDENT_HUB, to: ROOM_A3_74, avoidStairs: "maybe" });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "avoidStairs must be true or false");
});

// Test 8: Unknown places are a clean 404.
test("Story 6 returns 404 for an unknown start or destination", async () => {
  await withLocation(null, async () => {
    const badStart = await request({ from: "no-such-place", to: ROOM_A3_74 });
    const badEnd = await request({ from: STUDENT_HUB, to: "no-such-place" });

    assert.equal(badStart.statusCode, 404);
    assert.equal(badStart.body.success, false);
    assert.equal(badStart.body.message, "The start location is not in the campus records");
    assert.equal(badEnd.statusCode, 404);
    assert.equal(badEnd.body.message, "The destination is not in the campus records");
  });
});

// Test 9: A name shared by several places is not guessed.
test("Story 6 asks for the place ID when a name matches several places", async () => {
  await withLocation(null, async () => {
    const res = await request({ from: "AED", to: ROOM_A3_74 });

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /More than one place matches the start location/);
  });
});

// Test 10: Two places on the map with no walkable route between them.
test("Story 6 returns 404 when no route exists between two places", async () => {
  await withLocation(null, async () => {
    const res = await request({ from: STUDENT_HUB, to: GAMING_LOUNGE });

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(
      res.body.message,
      "The map shows no walkable route between these two places"
    );
  });
});

// Test 11: Unexpected database errors give a 500.
test("Story 6 returns 500 when the lookup fails", async () => {
  const originalFindOne = Location.findOne;
  const originalError = console.error;

  try {
    Location.findOne = () => ({
      async lean() {
        throw new Error("db down");
      }
    });
    console.error = () => {};

    const res = await request({ from: "no-such-place", to: ROOM_A3_74 });

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Unable to calculate route");
  } finally {
    Location.findOne = originalFindOne;
    console.error = originalError;
  }
});

// Test 12: Engine instructions become structured steps.
test("Story 6 describes each instruction as a structured step", () => {
  assert.deepEqual(describeStep("Start at Student Hub on Floor 2", 1), {
    step: 1, instruction: "Start at Student Hub on Floor 2", type: "start"
  });
  assert.deepEqual(describeStep("Walk 85 m south-west", 2), {
    step: 2, instruction: "Walk 85 m south-west", type: "walk", distanceMetres: 85
  });
  assert.deepEqual(describeStep("Stairs: Floor 2 → Floor 3", 3), {
    step: 3, instruction: "Stairs: Floor 2 → Floor 3", type: "stairs", fromFloor: "2", toFloor: "3"
  });
  assert.equal(describeStep("Cross the bridge from Block A to the B, C, D & E Blocks", 4).type, "bridge");
  assert.equal(describeStep("Arrive at A3-74", 5).type, "arrive");
});