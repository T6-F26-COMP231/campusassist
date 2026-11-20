import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acceptHelpRequest,
  createHelpStore,
  fetchPendingRequests,
  openHelpRequests,
  submitHelpRequest,
} from './helpRequests.js';

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

test('pending requests come from the backend and keep the database id', async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return {
      ok: true,
      json: async () => ({
        requests: [{ _id: 'abc123', currentLocation: 'B Block, Floor 1', assistanceType: 'Mobility Assistance', description: 'Student HUB' }],
      }),
    };
  };
  const result = await fetchPendingRequests('B');
  assert.match(calls[0], /\/api\/help-requests\/pending\?block=B$/);
  assert.deepEqual(result.requests, [
    { id: 'abc123', currentLocation: 'B Block, Floor 1', location: 'B Block, Floor 1', need: 'Mobility Assistance', description: 'Student HUB' },
  ]);
});

test('accept sends the id it is given and the helper id', async () => {
  let call;
  globalThis.fetch = async (url, options) => {
    call = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ request: {} }) };
  };
  await acceptHelpRequest('abc123', 'helper1');
  assert.match(call.url, /\/api\/help-requests\/abc123\/accept$/);
  assert.deepEqual(call.body, { helperId: 'helper1' });
});

test('accept success returns the server message as a sentence', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ message: 'Help request accepted successfully', request: {} }),
  });
  const result = await acceptHelpRequest('abc123', 'helper1');
  assert.equal(result.ok, true);
  assert.equal(result.message, 'Help request accepted successfully.');
});

test('a second accept shows the server conflict message', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({ message: 'Request is unavailable or already accepted' }),
  });
  const result = await acceptHelpRequest('abc123', 'helper1');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'Request is unavailable or already accepted.');
});

test('accept reports an unreachable server', async () => {
  globalThis.fetch = async () => {
    throw new Error('network down');
  };
  const result = await acceptHelpRequest('abc123', 'helper1');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'Could not reach the server. Please try again.');
});