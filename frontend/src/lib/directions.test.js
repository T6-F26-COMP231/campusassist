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

test('the requested destination does not replace the current location', () => {
  const currentLocation = 'Room B210';
  const requestedDestination = 'Student HUB';
  const result = directionSteps(currentLocation);

  assert.equal(result.location, 'Room B210');
  assert.deepEqual(result.steps, [
    'Start from your current position.',
    'Walk toward Room B210.',
    'Arrive at Room B210.',
  ]);
  assert.equal(
    result.steps.some((step) => step.includes(requestedDestination)),
    false
  );
});

test('a request without a location has no directions', () => {
  const result = directionSteps('   ');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'This request has no location to walk to.');
});

test('every supported request location gets the three standard steps', () => {
  const locations = [
    'A3-74',
    'B2-04',
    'Room B210',
    'B Block, Floor 1',
    'Student HUB',
  ];

  for (const location of locations) {
    assert.deepEqual(directionSteps(location), {
      ok: true,
      location,
      steps: [
        'Start from your current position.',
        `Walk toward ${location}.`,
        `Arrive at ${location}.`,
      ],
    });
  }
});

test('whitespace is trimmed before directions are generated', () => {
  const result = directionSteps('  A3-74  ');

  assert.equal(result.location, 'A3-74');
  assert.deepEqual(result.steps, [
    'Start from your current position.',
    'Walk toward A3-74.',
    'Arrive at A3-74.',
  ]);
});

test('a step-free route contains no stairs', () => {
  const result = stepFreeRoute('Bookstore');

  assert.equal(result.ok, true);
  assert.equal(result.steps.at(-1), 'Arrive at the Bookstore.');
  assert.equal(result.steps.some((step) => /stair/i.test(step)), false);
});

test('step-free requests remain handled by the separate exported helper', () => {
  const result = stepFreeRoute('Room B210');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'No step-free route is available.');
});
