import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLOSED_MESSAGE,
  EMPTY_MESSAGE,
  MESSAGE_LIMIT,
  NO_HELPER_MESSAGE,
  TOO_LONG_MESSAGE,
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
