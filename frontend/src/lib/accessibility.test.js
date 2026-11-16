import assert from 'node:assert/strict';
import test from 'node:test';
import { getAccessibilityFeatures, listAccessibilityFeatures } from './accessibility.js';

test('the accessible facilities are elevators, washrooms, ramps, and auto doors', () => {
  assert.deepEqual(listAccessibilityFeatures(), [
    'Elevators',
    'Accessible washrooms',
    'Ramps',
    'Auto doors',
  ]);
});

test('Student HUB includes an elevator', () => {
  const result = getAccessibilityFeatures('b-hub');

  assert.equal(result.ok, true);
  assert.equal(result.name, 'Student HUB');
  assert.ok(result.features.includes('Elevators'));
});

test('Room B210 has no accessible washroom', () => {
  const result = getAccessibilityFeatures('b-b210');

  assert.equal(result.ok, true);
  assert.equal(result.features.includes('Accessible washrooms'), false);
});

test('an unknown place is not found', () => {
  const result = getAccessibilityFeatures('missing');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'That place is not in the campus records.');
});
