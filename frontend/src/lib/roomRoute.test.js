import test from 'node:test';
import assert from 'node:assert/strict';

import {
  candidateCorridorForRoom,
  verifiedCorridorForRoom
} from './roomRoute.js';

test('finds candidate corridor for a known room', () => {
  assert.equal(
    candidateCorridorForRoom('B1-04'),
    'hub-b1'
  );

  assert.equal(
    candidateCorridorForRoom('A1-22'),
    'hub-a1'
  );
});

test('rejects rooms not found on the floor plan', () => {
  assert.equal(
    candidateCorridorForRoom('X9-999'),
    null
  );
});

test('does not invent unverified room connections', () => {
  assert.equal(
    verifiedCorridorForRoom('B1-04'),
    null
  );

  assert.equal(
    verifiedCorridorForRoom('A1-22'),
    null
  );
});
