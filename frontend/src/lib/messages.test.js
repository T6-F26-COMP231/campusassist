import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLOSED_MESSAGE,
  DELIVERY_FAILED_MESSAGE,
  EMPTY_MESSAGE,
  MESSAGE_LIMIT,
  NO_HELPER_MESSAGE,
  TOO_LONG_MESSAGE,
  deliverMessage,
  locationMessage,
  messagingState,
  sendMessage,
  validateMessage,
} from './messages.js';

const request = (status, helperId = 'helper1', extra = {}) => ({ _id: 'abc123', status, helperId, ...extra });

test('a message can be written once a helper has accepted, until the request closes', () => {
  for (const status of ['Accepted', 'On the Way', 'Arrived']) {
    assert.equal(messagingState(request(status)).allowed, true, status);
  }
});

test('no message can be written before a helper is assigned', () => {
  assert.deepEqual(messagingState(request('Pending', null)), { allowed: false, reason: NO_HELPER_MESSAGE });
  assert.equal(messagingState(request('Accepted', null)).reason, NO_HELPER_MESSAGE);
  assert.equal(messagingState(request('Pending')).reason, NO_HELPER_MESSAGE);
  assert.equal(messagingState(undefined).reason, NO_HELPER_MESSAGE);
  assert.equal(messagingState({ _id: 'x' }).allowed, false);
});

test('no message can be written after the request is completed or cancelled', () => {
  for (const status of ['Completed', 'Cancelled']) {
    assert.deepEqual(messagingState(request(status)), { allowed: false, reason: CLOSED_MESSAGE });
  }
});

test('the location on the request becomes a ready message', () => {
  assert.equal(locationMessage({ currentLocation: ' A3-74 ' }), 'I am at A3-74.');
  assert.equal(locationMessage({ currentLocation: '' }), '');
  assert.equal(locationMessage(undefined), '');
});

test('an empty or too long message is not accepted, each with its own message', () => {
  assert.deepEqual(validateMessage('   '), { ok: false, error: EMPTY_MESSAGE });
  assert.deepEqual(validateMessage(undefined), { ok: false, error: EMPTY_MESSAGE });
  assert.deepEqual(validateMessage('x'.repeat(MESSAGE_LIMIT + 1)), { ok: false, error: TOO_LONG_MESSAGE });
  assert.deepEqual(validateMessage('x'.repeat(MESSAGE_LIMIT)), { ok: true });
});

test('sending adds the trimmed message to the end of the thread, in order', () => {
  const now = new Date('2026-11-21T15:00:00Z');
  const first = sendMessage([], request('Accepted'), '  I am at A3-74.  ', now);
  const second = sendMessage(first.messages, request('Accepted'), 'By the elevator', now);

  assert.equal(first.ok, true);
  assert.deepEqual(first.message, { id: 'abc123-1', text: 'I am at A3-74.', sentAt: '2026-11-21T15:00:00.000Z' });
  assert.deepEqual(second.messages.map((m) => m.text), ['I am at A3-74.', 'By the elevator']);
  assert.equal(new Set(second.messages.map((m) => m.id)).size, 2);
});

test('sending does not change the thread that was passed in', () => {
  const thread = [{ id: 'abc123-1', text: 'Hello', sentAt: '2026-11-21T15:00:00.000Z' }];
  const copy = JSON.parse(JSON.stringify(thread));
  sendMessage(thread, request('Accepted'), 'More');

  assert.deepEqual(thread, copy);
});

test('a message is refused before a helper is assigned, after closing, and when empty', () => {
  assert.equal(sendMessage([], request('Pending', null), 'Hi').error, NO_HELPER_MESSAGE);
  assert.equal(sendMessage([], request('Completed'), 'Hi').error, CLOSED_MESSAGE);
  assert.equal(sendMessage([], request('Accepted'), '  ').error, EMPTY_MESSAGE);
  assert.equal(sendMessage([], request('Accepted'), 'x'.repeat(MESSAGE_LIMIT + 1)).error, TOO_LONG_MESSAGE);
});

test('a refused message adds nothing to the thread', () => {
  const result = sendMessage([], request('Pending', null), 'Hi');

  assert.equal(result.ok, false);
  assert.equal(result.messages, undefined);
});

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

test('a saved message is posted to that help request and returned for the list', async () => {
  let called;
  const result = await deliverMessage(
    { _id: '507f1f77bcf86cd799439011' },
    'I am at A3-74.',
    async (url, options) => {
      called = { url, options };
      return jsonResponse(201, {
        success: true,
        message: 'Message sent successfully',
        sentMessage: {
          id: 'msg1',
          text: 'I am at A3-74.',
          sentAt: '2026-11-22T15:00:00.000Z',
        },
      });
    }
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.message, {
    id: 'msg1',
    text: 'I am at A3-74.',
    sentAt: '2026-11-22T15:00:00.000Z',
  });
  assert.equal(called.url, '/api/help-requests/507f1f77bcf86cd799439011/messages');
  assert.equal(called.options.method, 'POST');
  assert.deepEqual(JSON.parse(called.options.body), {
    text: 'I am at A3-74.',
    senderRole: 'campus-user',
  });
});

test('a failed send keeps its own message and does not invent a sent message', async () => {
  const refused = await deliverMessage(
    { _id: '507f1f77bcf86cd799439011' },
    'Hello',
    async () => jsonResponse(500, { success: false, message: 'Unable to send the message' })
  );
  assert.deepEqual(refused, { ok: false, error: 'Unable to send the message.' });

  const offline = await deliverMessage(
    { _id: '507f1f77bcf86cd799439011' },
    'Hello',
    async () => { throw new Error('offline'); }
  );
  assert.deepEqual(offline, { ok: false, error: DELIVERY_FAILED_MESSAGE });
});
