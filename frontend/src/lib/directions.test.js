import assert from 'node:assert/strict';
import test from 'node:test';
import { directionSteps } from './directions.js';

test('directions end at the location in the request', () => {
  const result = directionSteps('  Room B210  ');

  assert.equal(result.ok, true);
  assert.equal(result.location, 'Room B210');
  assert.equal(result.steps.at(-1), 'Arrive at Room B210.');
  assert.deepEqual(result.steps, [
    'Start from your current position.',
    'Walk toward Room B210.',
    'Arrive at Room B210.',
  ]);
});

test('a request without a location has no directions', () => {
  const result = directionSteps('   ');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'This request has no location to walk to.');
});
