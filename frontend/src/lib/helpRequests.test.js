import assert from 'node:assert/strict';
import test from 'node:test';
import { createHelpStore, openHelpRequests, submitHelpRequest } from './helpRequests.js';

test('a request with a location is saved and appears in the open list', () => {
  const store = createHelpStore();
  const result = submitHelpRequest(store, {
    location: 'Room B101',
    description: 'Lost, need to get to Block C',
    type: 'Standard Guiding',
    ownerName: 'Sam Student',
  });

  assert.equal(result.ok, true);
  assert.equal(result.id, 'REQ-001');
  assert.deepEqual(openHelpRequests(store).map((request) => request.id), ['REQ-001']);
  assert.equal(openHelpRequests(store)[0].status, 'pending');
  assert.equal(openHelpRequests(store)[0].location, 'Room B101');
});

test('a request without a location is not saved', () => {
  const store = createHelpStore();
  const result = submitHelpRequest(store, { location: '   ' });

  assert.equal(result.ok, false);
  assert.equal(result.error, 'The request was not sent: choose your current location first.');
  assert.deepEqual(openHelpRequests(store), []);
});
