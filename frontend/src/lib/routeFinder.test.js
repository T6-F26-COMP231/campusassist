import test from 'node:test';
import assert from 'node:assert/strict';
import { findWalkingRoute } from './routeFinder.js';

test('Story 19 finds Bookstore to Student HUB route', () => {
  const result = findWalkingRoute('bookstore', 'student-hub');

  assert.equal(result.ok, true);

  assert.deepEqual(result.steps, [
    'Leave the Bookstore along the Block A hallway.',
    'Cross the bridge from Block A to Block B.',
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

test('Story 19 supports Student HUB to Bookstore', () => {
  const result = findWalkingRoute(
    'student-hub',
    'bookstore'
  );

  assert.equal(result.ok, true);
  assert.equal(result.steps.length, 3);
  assert.match(result.steps.at(-1), /Bookstore/i);
});

test('Story 19 accepts campus location names', () => {
  const result = findWalkingRoute(
    'Bookstore',
    'Student HUB'
  );

  assert.equal(result.ok, true);

  assert.deepEqual(result.steps, [
    'Leave the Bookstore along the Block A hallway.',
    'Cross the bridge from Block A to Block B.',
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

test('Story 19 supports recorded cross-block routes', () => {
  const result = findWalkingRoute(
    'hub-a2',
    'student-hub'
  );

  assert.equal(result.ok, true);
  assert.equal(result.steps.length > 0, true);
});

test('Story 19 uses elevators instead of stairs when requested', () => {
  const result = findWalkingRoute(
    'hub-a1',
    'hub-a2',
    { avoidStairs: true }
  );

  assert.equal(result.ok, true);
  assert.equal(
    result.steps.some((step) => /stairs/i.test(step)),
    false
  );
  assert.equal(
    result.steps.some((step) => /elevator/i.test(step)),
    true
  );
});

test('Story 19 rejects room routes without verified connections', () => {
  const result = findWalkingRoute('B1-03', 'A1-22');

  assert.equal(result.ok, false);
  assert.equal(
    result.error,
    'One or both locations are not in the campus route data.'
  );
});
