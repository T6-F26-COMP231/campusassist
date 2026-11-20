import assert from 'node:assert/strict';
import test from 'node:test';
import { NO_ROUTE_MESSAGE, routeDirections, routePlaces } from './routes.js';

test('Bookstore to Student HUB gives the steps in walking order', () => {
  const result = routeDirections('bookstore', 'student-hub');

  assert.equal(result.ok, true);
  assert.deepEqual(result.steps, [
    'Leave the Bookstore along the Block A hallway.',
    'Cross the bridge from Block A to Block B.',
    'Arrive at the Student HUB.',
  ]);
  assert.equal(result.steps.at(-1), 'Arrive at the Student HUB.');
});

test('a route with no recorded walk says so', () => {
  const result = routeDirections('student-hub', 'bookstore');

  assert.equal(result.ok, false);
  assert.equal(result.error, NO_ROUTE_MESSAGE);
});

test('missing or identical places are not routed', () => {
  assert.equal(routeDirections('', 'student-hub').ok, false);
  assert.equal(routeDirections('bookstore', 'nowhere').ok, false);
  assert.equal(routeDirections('bookstore', 'bookstore').error, 'You are already at your destination.');
});

test('the pickers list the places that have a recorded route', () => {
  assert.deepEqual(routePlaces().map((place) => place.name), ['Bookstore', 'Student HUB']);
});
