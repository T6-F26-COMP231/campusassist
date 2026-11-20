import test from 'node:test';
import assert from 'node:assert/strict';
import { findWalkingRoute } from './routeFinder.js';

test('Story 19 finds Bookstore to Student HUB route', () => {
  const result = findWalkingRoute('bookstore', 'student-hub');

  assert.equal(result.ok, true);

  assert.deepEqual(result.steps, [
    'Leave the Bookstore and enter the Block B second-floor hallway.',
    'Continue through the second-floor corridor toward the Student HUB.',
    'Arrive at the Student HUB.'
  ]);
});

test('Story 19 rejects unknown locations', () => {
  const result = findWalkingRoute('unknown', 'student-hub');

  assert.equal(result.ok, false);
});

test('Story 19 avoids stairs when requested', () => {
  const result = findWalkingRoute(
    'hub-a1',
    'student-hub',
    { avoidStairs: true }
  );

  assert.equal(result.ok, true);
  assert.equal(
    result.steps.some((step) => /stairs/i.test(step)),
    false
  );
});

test('Story 19 handles missing recorded routes', () => {
  const result = findWalkingRoute('student-hub', 'bookstore');

  assert.equal(result.ok, false);
});

test('Story 19 accepts campus location names', () => {
  const result = findWalkingRoute(
    'Bookstore',
    'Student HUB'
  );

  assert.equal(result.ok, true);

  assert.deepEqual(result.steps, [
    'Leave the Bookstore and enter the Block B second-floor hallway.',
    'Continue through the second-floor corridor toward the Student HUB.',
    'Arrive at the Student HUB.'
  ]);
});

test('Story 19 does not route through unverified room connections', () => {
  const result = findWalkingRoute('B1-04', 'A1-22');

  assert.equal(result.ok, false);
  assert.equal(
    result.error,
    'One or both locations are not in the campus route data.'
  );
});
