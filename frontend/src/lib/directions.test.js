import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NO_START_MESSAGE,
  directionSteps,
  locationNotOnMapMessage,
  startNotOnMapMessage,
} from './directions.js';
import { placeIdForLocation, routeDirections, routeGroups } from './routes.js';

const places = routeGroups().flatMap((group) => group.places);
const START = places.find((place) => place.name === 'A1-02').id;

test('a full room code gets the real route steps from the Get Directions generator', () => {
  const result = directionSteps('A1-51', { from: 'A1-02' });

  assert.equal(result.ok, true);
  assert.equal(result.location, 'A1-51');
  assert.equal(result.from, 'A1-02');
  assert.equal(result.to, 'A1-51');
  assert.ok(result.steps.length > 2);
  assert.equal(result.steps[0], 'Start at A1-02 on Floor 1');
  assert.equal(result.steps.at(-1), 'Arrive at A1-51');
  assert.equal(typeof result.totalMetres, 'number');
  assert.equal(typeof result.minutes, 'number');
  assert.ok(Array.isArray(result.legs) && result.legs.length > 0);
});

test('the steps are exactly what Get Directions finds between the same two places', () => {
  const toId = placeIdForLocation('A1-51');
  const helper = directionSteps('A1-51', { from: 'A1-02' });
  const getDirections = routeDirections(START, toId, { avoidStairs: false, blocked: [] });

  assert.deepEqual(helper, { ...getDirections, location: 'A1-51' });
});

test('no step is a placeholder step', () => {
  const result = directionSteps('A1-51', { from: 'A1-02' });

  assert.ok(result.steps.every((step) => !/Start from your current position|Walk toward/.test(step)));
});

test('the location is matched whatever its case or spacing, and the start can be an id or a room code', () => {
  const expected = directionSteps('A1-51', { from: 'A1-02' }).steps;

  for (const location of ['  A1-51  ', 'a1-51']) {
    assert.deepEqual(directionSteps(location, { from: 'A1-02' }).steps, expected, location);
  }
  for (const from of [START, ` ${START} `, 'a1-02']) {
    assert.deepEqual(directionSteps('A1-51', { from }).steps, expected, String(from));
  }
});

test('a place with a room code in its name is found by that code', () => {
  const result = directionSteps('B2-02', { from: 'A1-02' });

  assert.equal(result.ok, true);
  assert.equal(result.location, 'Bookstore (B2-02)');
});

test('a partial room code such as "A-02" is reported as not on the map, with no steps', () => {
  const result = directionSteps('A-02', { from: 'A1-02' });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'LOCATION_NOT_ON_MAP');
  assert.equal(result.notOnMap, true);
  assert.equal(result.location, 'A-02');
  assert.equal(result.error, "The user's location (A-02) isn't on the map, so no route is available.");
  assert.equal(result.error, locationNotOnMapMessage('A-02'));
  assert.equal(result.steps, undefined);
  assert.equal(result.legs, undefined);
});

test('other locations the map does not have are also reported, never given made-up steps', () => {
  for (const location of ['A02', 'B Block, Floor 1', 'Room B210', 'near the entrance', 'Bookstore']) {
    const result = directionSteps(location, { from: 'A1-02' });

    assert.equal(result.ok, false, location);
    assert.equal(result.code, 'LOCATION_NOT_ON_MAP', location);
    assert.equal(result.steps, undefined, location);
  }
});

test('a location that is not on the map is reported even before a start is known', () => {
  const result = directionSteps('A-02');

  assert.equal(result.code, 'LOCATION_NOT_ON_MAP');
});

test('a request without a location has no directions', () => {
  const result = directionSteps('   ');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'This request has no location to walk to.');
  assert.equal(result.code, 'NO_LOCATION');
});

test('a missing or non-text location has no directions', () => {
  for (const location of [undefined, null, 42]) {
    const result = directionSteps(location, { from: 'A1-02' });

    assert.equal(result.ok, false);
    assert.equal(result.code, 'NO_LOCATION');
  }
});

test('a walk needs a start: without one the result says so and gives no steps', () => {
  for (const options of [undefined, {}, { from: '' }, { from: '   ' }, { stepFree: true }]) {
    const result = directionSteps('A1-51', options);

    assert.equal(result.ok, false);
    assert.equal(result.code, 'NO_START');
    assert.equal(result.error, NO_START_MESSAGE);
    assert.equal(result.location, 'A1-51');
    assert.equal(result.steps, undefined);
  }
});

test('a start that is not on the map is reported', () => {
  const result = directionSteps('A1-51', { from: 'A-02' });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'START_NOT_ON_MAP');
  assert.equal(result.notOnMap, true);
  assert.equal(result.start, 'A-02');
  assert.equal(result.error, startNotOnMapMessage('A-02'));
  assert.equal(result.steps, undefined);
});

test('a step-free route avoids stairs, as Get Directions does', () => {
  const toId = placeIdForLocation('A1-51');
  const result = directionSteps('A1-51', { from: 'A1-02', stepFree: true });

  assert.equal(result.ok, true);
  assert.equal(result.stepFree, true);
  assert.equal(result.usesStairs, false);
  assert.equal(result.steps.some((step) => /stairs/i.test(step)), false);
  assert.deepEqual(result, { ...routeDirections(START, toId, { avoidStairs: true, blocked: [] }), location: 'A1-51' });
});

test('a place kept off the walk by an approved barrier stops the route', () => {
  const toId = placeIdForLocation('A1-51');
  const result = directionSteps('A1-51', { from: 'A1-02', blocked: [toId] });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'NO_ROUTE');
  assert.equal(result.error, 'An approved barrier blocks A1-51.');
  assert.equal(result.location, 'A1-51');
  assert.equal(result.steps, undefined);
});

test('being at the destination already is reported as a route result, not as steps', () => {
  const result = directionSteps('A1-51', { from: 'A1-51' });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'NO_ROUTE');
  assert.equal(result.error, 'You are already at your destination.');
});

test('no result, found or refused, contains placeholder steps', () => {
  const results = [
    directionSteps('A1-51', { from: 'A1-02' }),
    directionSteps('A1-51', { from: 'A1-02', stepFree: true }),
    directionSteps('A-02', { from: 'A1-02' }),
    directionSteps('A1-51'),
    directionSteps(''),
  ];

  for (const result of results) {
    for (const step of result.steps ?? []) {
      assert.doesNotMatch(step, /Start from your current position|Walk toward/);
    }
  }
});