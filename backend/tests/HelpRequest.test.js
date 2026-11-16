
import test from "node:test";
import assert from "node:assert/strict";
import HelpRequest from "../models/HelpRequest.js";

test("Creates a valid help request", () => {
  const request = new HelpRequest({
    currentLocation: "a3-74",
    description: "by the washroom",
    assistanceType: "Standard Guiding"
  });

  assert.equal(request.validateSync(), undefined);
});

test("Requires a location", () => {
  const request = new HelpRequest({
    description: "by the washroom",
    assistanceType: "Standard Guiding"
  });

  const error = request.validateSync();

  assert.ok(error?.errors.currentLocation);
});

test("Defaults status to Pending", () => {
  const request = new HelpRequest({
    currentLocation: "a3-74",
    assistanceType: "Standard Guiding"
  });

  assert.equal(request.status, "Pending");
});

test("Accepts Mobility Assistance", () => {
  const request = new HelpRequest({
    currentLocation: "a3-74",
    assistanceType: "Mobility Assistance"
  });

  assert.equal(request.validateSync(), undefined);
});

test("Accepts Other assistance", () => {
  const request = new HelpRequest({
    currentLocation: "a3-74",
    assistanceType: "Other"
  });

  assert.equal(request.validateSync(), undefined);
});

test("Rejects an invalid assistance type", () => {
  const request = new HelpRequest({
    currentLocation: "a3-74",
    assistanceType: "Unknown"
  });

  const error = request.validateSync();

  assert.ok(error?.errors.assistanceType);
});

test("New request has no assigned helper", () => {
  const request = new HelpRequest({
    currentLocation: "a3-74",
    assistanceType: "Standard Guiding"
  });

  assert.equal(request.helperId, null);
});
