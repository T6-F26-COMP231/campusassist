import assert from 'node:assert/strict';
import test from 'node:test';
import { directionSteps, stepFreeRoute } from './directions.js';

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

test('a step-free route contains no stairs', () => {
  const result = stepFreeRoute('Bookstore');

  assert.equal(result.ok, true);
  assert.equal(result.steps.at(-1), 'Arrive at the Bookstore.');
  assert.equal(result.steps.some((step) => /stair/i.test(step)), false);
});

test('a step-free route that does not exist says so', () => {
  const result = directionSteps('Room B210', { stepFree: true });

  assert.equal(result.ok, false);
  assert.equal(result.error, 'No step-free route is available.');
});
