import assert from 'node:assert/strict';
import test from 'node:test';
import { MAP_PLACES } from './mapPlaces.js';
import { distanceAndTime, extraDistance, floorLabels, placeOption, stairsChip } from './routeSummary.js';
import { routeDirections } from './routes.js';

const find = (text) => String(MAP_PLACES.find((place) => place[1].includes(text))[0]);

test('a place in the From and To lists shows its name and floor', () => {
  assert.equal(placeOption({ name: 'A1-51', floor: '1' }), 'A1-51 · Floor 1');
});

test('a step-free route is summed up as no stairs, its distance and time, and how much longer', () => {
  const route = routeDirections(find('A1-51'), find('A5-02'), { avoidStairs: true });

  assert.equal(route.ok, true);
  assert.equal(stairsChip(route), 'No stairs');
  assert.equal(distanceAndTime(route), `${route.totalMetres} m · ${route.minutes} min`);
  assert.match(distanceAndTime(route), /^\d+ m · \d+ min$/);
  assert.equal(extraDistance(route), `${route.extraMetres} m longer than the stairs route`);
  assert.ok(route.extraMetres > 0);
});

test('a route that uses stairs says so, and has no extra distance', () => {
  const route = routeDirections(find('A1-51'), find('A5-02'));

  assert.equal(stairsChip(route), 'Uses stairs');
  assert.equal(extraDistance(route), '');
});

test('a route with no stairs and no choice made has no chip', () => {
  const route = routeDirections(find('Bookstore'), find('Student Hub'));

  assert.equal(stairsChip(route), '');
  assert.equal(extraDistance(route), '');
});

test('a step-free route that is as short as the usual one has no extra distance line', () => {
  const route = routeDirections(find('Bookstore'), find('Student Hub'), { avoidStairs: true });

  assert.equal(stairsChip(route), 'No stairs');
  assert.equal(extraDistance(route), '');
});

test('floor tabs are plain, and numbered only when a floor is visited twice', () => {
  assert.deepEqual(floorLabels([{ floor: '1' }, { floor: '5' }]), ['Floor 1', 'Floor 5']);
  assert.deepEqual(floorLabels([{ floor: '2' }]), ['Floor 2']);
  assert.deepEqual(floorLabels([{ floor: '1' }, { floor: '2' }, { floor: '1' }]), ['1. Floor 1', '2. Floor 2', '3. Floor 1']);
});
