import assert from 'node:assert/strict';
import test from 'node:test';
import { MAP_PLACES } from './mapPlaces.js';
import { planLeg, planPageForRouteFloor } from './routeMap.js';
import {
  NO_PATH_MESSAGE,
  NO_STEP_FREE_MESSAGE,
  routeDirections,
  routeGroups,
  routePlaceCount,
} from './routes.js';

const find = (text) => String(MAP_PLACES.find((place) => place[1].includes(text))[0]);

test('the pickers list every place on the map, grouped by building', () => {
  const groups = routeGroups();
  const listed = groups.flatMap((group) => group.places);

  assert.equal(listed.length, MAP_PLACES.length);
  assert.equal(routePlaceCount(), MAP_PLACES.length);
  assert.equal(new Set(listed.map((place) => place.id)).size, listed.length);
  assert.ok(groups.length >= 5);
});

test('Bookstore, Pizza Pizza and Student Hub are listed', () => {
  const names = routeGroups().flatMap((group) => group.places.map((place) => place.name));

  assert.ok(names.some((name) => name.startsWith('Bookstore')));
  assert.ok(names.some((name) => name.startsWith('Pizza Pizza')));
  assert.ok(names.includes('Student Hub'));
});

test('a walk on one floor starts at the start place and ends at the destination', () => {
  const result = routeDirections(find('Bookstore'), find('Student Hub'));

  assert.equal(result.ok, true);
  assert.match(result.steps[0], /^Start at Bookstore/);
  assert.match(result.steps[1], /^Walk \d+ m [a-z-]+/);
  assert.equal(result.steps.at(-1), 'Arrive at Student Hub');
  assert.equal(result.legs.length, 1);
});

test('a walk between floors rides the elevator once, in order', () => {
  const result = routeDirections(find('A1-51'), find('A3-74'), { avoidStairs: true });

  assert.equal(result.ok, true);
  const text = result.steps.join('|');
  assert.ok(result.steps.includes('Elevator: Floor 1 → Floor 3'));
  assert.ok(text.indexOf('Start at A1-51') < text.indexOf('Elevator: Floor') && text.indexOf('Elevator: Floor') < text.indexOf('Arrive at A3-74'));
  assert.deepEqual(result.legs.map((leg) => leg.floor), ['1', '3']);
});

test('avoiding stairs never gives a step that uses stairs', () => {
  const result = routeDirections(find('A1-51'), find('Pizza Pizza'), { avoidStairs: true });

  assert.equal(result.ok, true);
  assert.equal(result.steps.some((step) => /stairs/i.test(step)), false);
});

test('places in different buildings are joined by the corridors on the map', () => {
  const result = routeDirections(find('A2-65'), find('Bookstore'));

  assert.equal(result.ok, true);
  assert.ok(result.totalMetres > 20);
});

test('a route between two blocks crosses the bridge, in walking order', () => {
  const result = routeDirections(find('A2-65A'), find('Bookstore'));

  assert.equal(result.ok, true);
  const bridge = result.steps.findIndex((step) => /^Cross the bridge from Block A to the B, C, D & E Blocks$/.test(step));
  assert.ok(bridge > 0, 'the bridge step is listed');
  assert.match(result.steps[0], /^Start at A2-65A/);
  assert.ok(bridge < result.steps.length - 1);
  assert.match(result.steps[bridge - 1], /to the bridge$/);
  assert.match(result.steps[bridge + 1], /^Walk \d+ m/);
  assert.equal(result.steps.at(-1), 'Arrive at Bookstore (B2-02)');
  assert.equal(result.steps.filter((step) => /bridge$|^Cross the bridge/.test(step)).length, 2);
});

test('the bridge is crossed in the other direction too', () => {
  const result = routeDirections(find('Bookstore'), find('A2-65A'));

  assert.equal(result.ok, true);
  assert.ok(result.steps.includes('Cross the bridge from the B, C, D & E Blocks to Block A'));
});

test('a route inside one block has no bridge step', () => {
  const result = routeDirections(find('Bookstore'), find('Student Hub'));

  assert.equal(result.ok, true);
  assert.equal(result.steps.some((step) => /bridge/i.test(step)), false);
});

test('the route on the map is the same path as the steps', () => {
  const result = routeDirections(find('A1-51'), find('A3-74'), { avoidStairs: true });
  const first = result.legs[0].points[0];
  const lastLeg = result.legs.at(-1).points;

  const start = MAP_PLACES.find((place) => place[1] === 'A1-51');
  const end = MAP_PLACES.find((place) => place[1] === 'A3-74');
  assert.deepEqual([first.lon, first.lat], [start[4], start[5]]);
  assert.deepEqual([lastLeg.at(-1).lon, lastLeg.at(-1).lat], [end[4], end[5]]);
  const walks = result.steps.filter((step) => /\d+ m( |$)/.test(step)).length;
  const segments = result.legs.reduce((sum, leg) => sum + leg.points.length - 1, 0);
  assert.equal(walks, segments);
});

test('the path is placed on the floor plan page for its floor', () => {
  const result = routeDirections(find('A1-51'), find('A3-74'), { avoidStairs: true });
  const drawn = result.legs.map((leg) => planLeg(leg, 'A'));

  assert.deepEqual(drawn.map((leg) => leg.page), [1, 3]);
  for (const leg of drawn) {
    for (const p of leg.points) {
      assert.ok(p.x > 0 && p.x < leg.size.width && p.y > 0 && p.y < leg.size.height);
    }
  }
  assert.equal(planPageForRouteFloor('B'), null);
  assert.equal(planPageForRouteFloor('8'), 5);
});

test('missing or identical places are not routed', () => {
  assert.equal(routeDirections('', find('A1-51')).ok, false);
  assert.equal(routeDirections(find('A1-51'), 'nowhere').ok, false);
  assert.equal(routeDirections(find('A1-51'), find('A1-51')).error, 'You are already at your destination.');
});

test('every route either has directions or says why not', () => {
  const sample = MAP_PLACES.filter((_, i) => i % 250 === 0);
  for (const a of sample) {
    for (const b of sample) {
      if (a[0] === b[0]) continue;
      const result = routeDirections(a[0], b[0]);
      assert.ok(result.ok || result.error, `${a[1]} to ${b[1]}`);
      if (result.ok) {
        assert.match(result.steps[0], /^Start at /);
        assert.equal(result.steps.at(-1), `Arrive at ${b[1]}`);
      } else {
        assert.ok(result.error.length > 0 && NO_PATH_MESSAGE.length > 0);
      }
    }
  }
});

test('a step-free route never uses stairs and says it is step-free', () => {
  const result = routeDirections(find('A1-51'), find('A5-02'), { avoidStairs: true });

  assert.equal(result.ok, true);
  assert.equal(result.stepFree, true);
  assert.equal(result.usesStairs, false);
  assert.equal(result.steps.some((step) => /stairs/i.test(step)), false);
  assert.ok(result.steps.some((step) => /^Elevator: Floor 1 → Floor 5$/.test(step)));
  assert.equal(result.steps.at(-1), 'Arrive at A5-02');
});

test('a step-free route says how much longer it is than the route with stairs', () => {
  const usual = routeDirections(find('A1-51'), find('A5-02'));
  const stepFree = routeDirections(find('A1-51'), find('A5-02'), { avoidStairs: true });

  assert.equal(usual.stepFree, false);
  assert.equal(usual.usesStairs, true);
  assert.ok(stepFree.extraMetres > 0);
  assert.equal(stepFree.extraMetres, stepFree.totalMetres - usual.totalMetres);
});

test('a step-free route as short as the usual one has no extra distance', () => {
  const result = routeDirections(find('Bookstore'), find('Student Hub'), { avoidStairs: true });

  assert.equal(result.ok, true);
  assert.equal(result.extraMetres, 0);
});

test('when only a route with stairs exists, the message says so', () => {
  const result = routeDirections(find('A1-51'), find('P1-07'), { avoidStairs: true });

  assert.equal(result.ok, false);
  assert.equal(result.error, NO_STEP_FREE_MESSAGE);
  assert.equal(result.stairsRouteExists, true);
  assert.equal(routeDirections(find('A1-51'), find('P1-07')).ok, true);
});

test('with no walkable route at all the step-free message is not used', () => {
  const result = routeDirections(find('A1-51'), find('R0-05'), { avoidStairs: true });

  assert.equal(result.ok, false);
  assert.equal(result.error, NO_PATH_MESSAGE);
});

test('choosing step-free does not change later routes that allow stairs', () => {
  const before = routeDirections(find('A1-51'), find('A5-02'));
  routeDirections(find('A1-51'), find('A5-02'), { avoidStairs: true });
  const after = routeDirections(find('A1-51'), find('A5-02'));

  assert.deepEqual(after.steps, before.steps);
});
