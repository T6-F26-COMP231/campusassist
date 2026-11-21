import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NO_HELPER_MESSAGE,
  acceptHelpRequest,
  fetchRequestStatus,
  isFinalStatus,
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

test('accept without a helper account makes no request and says why', async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return { ok: true, json: async () => ({}) };
  };
  for (const helperId of [undefined, '']) {
    const result = await acceptHelpRequest('abc123', helperId);
    assert.equal(result.ok, false);
    assert.equal(result.error, NO_HELPER_MESSAGE);
  }
  assert.equal(called, false);
});

test('accept success returns the saved request with its Accepted status', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ message: 'Help request accepted successfully', request: { _id: 'abc123', status: 'Accepted' } }),
  });
  const result = await acceptHelpRequest('abc123', 'helper1');
  assert.equal(result.request.status, 'Accepted');
});

test('the user status check asks for the status of their own request', async () => {
  let url;
  globalThis.fetch = async (u) => {
    url = u;
    return { ok: true, json: async () => ({ request: { _id: 'abc123', status: 'Accepted', helperId: 'helper1' } }) };
  };
  const result = await fetchRequestStatus('abc123');
  assert.match(url, /\/api\/help-requests\/abc123\/status$/);
  assert.equal(result.ok, true);
  assert.equal(result.request.status, 'Accepted');
});

test('the user status check reports a missing request, a server error and no connection', async () => {
  assert.equal((await fetchRequestStatus('')).error, 'No request selected.');

  globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Not found' }) });
  assert.equal((await fetchRequestStatus('abc123')).error, 'Unable to load request status.');

  globalThis.fetch = async () => ({ ok: true, json: async () => '<html>' });
  assert.equal((await fetchRequestStatus('abc123')).ok, false);

  globalThis.fetch = async () => {
    throw new Error('network down');
  };
  assert.equal((await fetchRequestStatus('abc123')).error, 'Could not reach the server. Please try again.');
});

test('a request stops changing once it is completed or cancelled', () => {
  assert.equal(isFinalStatus('Completed'), true);
  assert.equal(isFinalStatus('Cancelled'), true);
  for (const status of ['Pending', 'Accepted', 'On the Way']) {
    assert.equal(isFinalStatus(status), false);
  }
});

test('the user status check says the request was not found for a 404 or a bad id', async () => {
  for (const status of [404, 400]) {
    globalThis.fetch = async () => ({
      ok: false,
      status,
      json: async () => ({ message: 'Help request not found' }),
    });
    const result = await fetchRequestStatus('abc123');
    assert.equal(result.ok, false);
    assert.equal(result.error, 'Request not found.');
  }
});

test('the user status check keeps the general message for a server error', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ message: 'Unable to retrieve help request status' }),
  });
  assert.equal((await fetchRequestStatus('abc123')).error, 'Unable to load request status.');
});