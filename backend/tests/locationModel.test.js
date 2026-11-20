import test from "node:test";
import assert from "node:assert/strict";
import Location from "../models/Location.js";

test("Story 2 - Location stores campus details", () => {
  const location = new Location({
    locationId: "B2-02",
    name: "Bookstore",
    block: "b",
    floor: 2,
    roomNumber: "02"
  });

  const error = location.validateSync();

  assert.equal(error, undefined);
  assert.equal(location.locationId, "B2-02");
  assert.equal(location.name, "Bookstore");
  assert.equal(location.block, "B");
  assert.equal(location.floor, 2);
  assert.equal(location.roomNumber, "02");
});

test("Story 2 - Location requires an ID and name", () => {
  const location = new Location({ block: "A" });
  const error = location.validateSync();

  assert.ok(error);
  assert.ok(error.errors.locationId);
  assert.ok(error.errors.name);
});

test("Story 2 - Location rejects invalid campus blocks", () => {
  const location = new Location({
    locationId: "TEST-01",
    name: "Test Room",
    block: "Z",
    floor: 1
  });

  const error = location.validateSync();

  assert.ok(error);
  assert.ok(error.errors.block);
});
