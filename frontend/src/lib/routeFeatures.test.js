import test from 'node:test';
import assert from 'node:assert/strict';

import {
  identifyRouteFeatures,
  usesStairs,
  getStepFreeConnections
} from './routeFeatures.js';

test('Story 7 identifies recorded elevators', () => {
  const features = identifyRouteFeatures();

  assert.equal(features.elevators.length, 3);
  assert.ok(
    features.elevators.every(
      (connection) => connection.kind === 'elevator'
    )
  );
});

test('Story 7 identifies recorded stairs', () => {
  const features = identifyRouteFeatures();

  assert.equal(features.stairs.length, 3);
});

test('Story 7 reports no recorded ramps', () => {
  const features = identifyRouteFeatures();

  assert.equal(features.ramps.length, 0);
});

test('Story 7 excludes stairs from step-free connections', () => {
  const connections = getStepFreeConnections();

  assert.ok(
    connections.every(
      (connection) => !usesStairs(connection)
    )
  );
});

test('Story 7 preserves elevator connections', () => {
  const connections = getStepFreeConnections();

  assert.equal(
    connections.filter(
      (connection) => connection.kind === 'elevator'
    ).length,
    3
  );
});
