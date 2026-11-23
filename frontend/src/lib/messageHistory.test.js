import assert from 'node:assert/strict';
import test from 'node:test';
import { LOAD_FAILED_MESSAGE, applyLoadedMessages, fetchMessages, mergeMessages } from './messageHistory.js';

const stored = (id, senderRole, text, sentAt) => ({
  id,
  requestId: 'REQ1',
  senderRole,
  senderId: null,
  text,
  sentAt,
});

const reply = (body, { ok = true, status = 200 } = {}) => async () => ({
  ok,
  status,
  json: async () => body,
});

test('fetchMessages asks for the messages of the request with a plain GET', async () => {
  let call;
  const fetchImpl = async (url, init) => {
    call = { url, init };
    return { ok: true, status: 200, json: async () => ({ success: true, count: 0, messages: [] }) };
  };

  await fetchMessages('abc 123', fetchImpl);

  assert.match(call.url, /\/api\/help-requests\/abc%20123\/messages$/);
  assert.equal(call.init, undefined);
});

test('fetchMessages returns the Campus User messages as { id, text, sentAt }, oldest first', async () => {
  const body = {
    success: true,
    count: 2,
    messages: [
      stored('m1', 'campus-user', 'I am at A3-74.', '2026-11-23T12:00:00.000Z'),
      stored('m2', 'campus-user', 'By the main door.', '2026-11-23T12:01:00.000Z'),
    ],
  };

  const result = await fetchMessages('REQ1', reply(body));

  assert.equal(result.ok, true);
  assert.deepEqual(result.messages, [
    { id: 'm1', text: 'I am at A3-74.', sentAt: '2026-11-23T12:00:00.000Z' },
    { id: 'm2', text: 'By the main door.', sentAt: '2026-11-23T12:01:00.000Z' },
  ]);
});

test('fetchMessages leaves out messages that are not from the Campus User', async () => {
  const body = {
    success: true,
    count: 2,
    messages: [
      stored('m1', 'campus-user', 'Hello', '2026-11-23T12:00:00.000Z'),
      stored('m2', 'helper', 'On my way', '2026-11-23T12:01:00.000Z'),
    ],
  };

  const result = await fetchMessages('REQ1', reply(body));

  assert.deepEqual(result.messages.map((message) => message.id), ['m1']);
});

test('fetchMessages returns an empty list when nothing was sent yet', async () => {
  const result = await fetchMessages('REQ1', reply({ success: true, count: 0, messages: [] }));

  assert.deepEqual(result, { ok: true, messages: [] });
});

test('fetchMessages does not fail on a time it cannot read', async () => {
  const body = { success: true, messages: [stored('m1', 'campus-user', 'Hi', 'not a date')] };

  const result = await fetchMessages('REQ1', reply(body));

  assert.equal(result.ok, true);
  assert.ok(Number.isFinite(new Date(result.messages[0].sentAt).getTime()));
});

test('fetchMessages reports a failure instead of throwing', async () => {
  const failures = [
    undefined,
    reply({ success: false, message: 'Help request not found' }, { ok: false, status: 404 }),
    reply({ success: true }),
    reply({ success: true, messages: 'nope' }),
    async () => {
      throw new Error('offline');
    },
  ];

  for (const fetchImpl of failures) {
    const result = await fetchMessages(fetchImpl ? 'REQ1' : '', fetchImpl);

    assert.deepEqual(result, { ok: false, error: LOAD_FAILED_MESSAGE });
  }
});

test('mergeMessages keeps a message that was sent while the list was loading', () => {
  const loaded = [{ id: 'm1', text: 'First', sentAt: '2026-11-23T12:00:00.000Z' }];
  const current = [
    { id: 'm1', text: 'First', sentAt: '2026-11-23T12:00:00.000Z' },
    { id: 'm2', text: 'Just sent', sentAt: '2026-11-23T12:05:00.000Z' },
  ];

  assert.deepEqual(
    mergeMessages(loaded, current).map((message) => message.id),
    ['m1', 'm2']
  );
});

test('mergeMessages counts a message once and puts the thread oldest first', () => {
  const a = { id: 'a', text: 'A', sentAt: '2026-11-23T12:00:00.000Z' };
  const b = { id: 'b', text: 'B', sentAt: '2026-11-23T12:01:00.000Z' };

  assert.deepEqual(mergeMessages([b, a], [a, b]), [a, b]);
  assert.deepEqual(mergeMessages([], []), []);
  assert.deepEqual(mergeMessages(undefined, undefined), []);
});

test('a failed load keeps the messages on screen and shows its own message', () => {
  const current = [{ id: 'm1', text: 'I am at A3-74.', sentAt: '2026-11-23T12:00:00.000Z' }];

  assert.deepEqual(
    applyLoadedMessages({ ok: false, error: LOAD_FAILED_MESSAGE }, current),
    { messages: current, error: LOAD_FAILED_MESSAGE }
  );
});

test('a saved load shows the server messages and clears the failure', () => {
  const current = [{ id: 'm2', text: 'Just sent', sentAt: '2026-11-23T12:05:00.000Z' }];
  const loaded = [{ id: 'm1', text: 'First', sentAt: '2026-11-23T12:00:00.000Z' }];

  assert.deepEqual(
    applyLoadedMessages({ ok: true, messages: loaded }, current),
    {
      messages: [
        loaded[0],
        current[0],
      ],
      error: '',
    }
  );
});