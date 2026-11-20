import assert from 'node:assert/strict';
import test from 'node:test';
import { BOOKSTORE_TO_HUB, CONNECTIONS, CORRIDORS, PLACES, connectionText } from './routeData.js';

test('the walk from the Bookstore to the Student HUB lists every step and ends there', () => {
  const steps = connectionText(BOOKSTORE_TO_HUB);

  assert.deepEqual(steps, [
    'Leave the Bookstore along the Block A hallway.',
    'Cross the bridge from Block A to Block B.',
    'Arrive at the Student HUB.',
  ]);
  assert.equal(steps.at(-1), 'Arrive at the Student HUB.');
  assert.equal(PLACES.find((place) => place.name === 'Student HUB').id, 'student-hub');
});

test('a route between two blocks includes the bridge', () => {
  const bridge = CONNECTIONS.find((connection) => connection.id === 'bridge-ab');

  assert.equal(bridge.kind, 'bridge');
  assert.equal(bridge.from, 'hub-a2');
  assert.equal(bridge.to, 'hub-b2');
  assert.equal(BOOKSTORE_TO_HUB.includes('bridge-ab'), true);
});

test('Blocks A, B, and C have hallways, stairs, and elevators', () => {
  for (const block of ['A', 'B', 'C']) {
    assert.ok(CORRIDORS.some((corridor) => corridor.block === block));
    assert.ok(CONNECTIONS.some((connection) => connection.id === `${block.toLowerCase()}-stairs`));
    assert.ok(CONNECTIONS.some((connection) => connection.id === `${block.toLowerCase()}-elevator`));
  }
});
