import assert from 'node:assert/strict';
import test from 'node:test';
import { BOOKSTORE_TO_HUB, CONNECTIONS, CORRIDORS, PLACES, connectionText } from './routeData.js';

test('the walk from the Bookstore to the Student HUB lists every step and ends there', () => {
  const steps = connectionText(BOOKSTORE_TO_HUB);

  assert.deepEqual(steps, [
    'Leave the Bookstore and enter the Block B second-floor hallway.',
    'Continue through the second-floor corridor toward the Student HUB.',
    'Arrive at the Student HUB.',
  ]);
  assert.equal(steps.at(-1), 'Arrive at the Student HUB.');
  assert.equal(PLACES.find((place) => place.name === 'Student HUB').id, 'student-hub');
});

test('the A-B bridge remains separate from the Bookstore-to-HUB route', () => {
  const bridge = CONNECTIONS.find((connection) => connection.id === 'bridge-ab');

  assert.equal(bridge.kind, 'bridge');
  assert.equal(bridge.from, 'hub-a2');
  assert.equal(bridge.to, 'hub-b2');
  assert.equal(BOOKSTORE_TO_HUB.includes('bridge-ab'), false);
});

test('Blocks A, B, and C have hallways, stairs, and elevators', () => {
  for (const block of ['A', 'B', 'C']) {
    assert.ok(CORRIDORS.some((corridor) => corridor.block === block));
    assert.ok(CONNECTIONS.some((connection) => connection.id === `${block.toLowerCase()}-stairs`));
    assert.ok(CONNECTIONS.some((connection) => connection.id === `${block.toLowerCase()}-elevator`));
  }
});
