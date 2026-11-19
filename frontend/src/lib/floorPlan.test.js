import assert from 'node:assert/strict';
import test from 'node:test';
import { locateRoom, planPageForFloor } from './floorPlan.js';

test('the floor digit picks the plan page', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 8].map(planPageForFloor), [1, 1, 2, 3, 4, 5, 5, 5]);
});

test('A3-74 is on the third-floor plan', () => {
  const room = locateRoom('A3-74');
  assert.equal(room.page, 3);
  assert.equal(room.code, 'A3-74');
  assert.equal(room.spots.length, 1);
});

test('the marker follows the location instead of one fixed spot', () => {
  const a = locateRoom('A3-74');
  const b = locateRoom('B3-04');
  const c = locateRoom('A2-90');
  assert.notDeepEqual(a.spots, b.spots);
  assert.equal(c.page, 2);
  assert.notEqual(c.page, a.page);
});

test('codes are read from free text, in any letter case', () => {
  assert.deepEqual(locateRoom('Near room a3-74, Block A'), locateRoom('A3-74'));
  assert.equal(locateRoom('I am at a3-74 by the stairs').code, 'A3-74');
  assert.deepEqual(locateRoom('A3 - 74'), locateRoom('A3-74'));
  assert.deepEqual(locateRoom('A3 -74'), locateRoom('A3-74'));
});

test('floor 5 and up and floor 0 codes use their own pages', () => {
  assert.equal(locateRoom('A6-09').page, 5);
  assert.equal(locateRoom('A8-33').page, 5);
  assert.equal(locateRoom('R0-21').page, 1);
});

test('a room that is not on the plan gets no spot', () => {
  assert.equal(locateRoom('A3-999'), null); // right shape, no such room
  assert.equal(locateRoom('A9-01'), null); // no such floor on the plan
  assert.equal(locateRoom('Room B101'), null); // not a room code
  assert.equal(locateRoom('B Block, Floor 1'), null);
  assert.equal(locateRoom(''), null);
  assert.equal(locateRoom(undefined), null);
});

test('a room code only counts on its own floor page', () => {
  assert.equal(locateRoom('D2-01').page, 2); // the legend example is not a room
  assert.equal(locateRoom('A1-96').spots.length, 2); // two labels on the drawing, both marked
});
