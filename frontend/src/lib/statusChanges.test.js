import assert from 'node:assert/strict';
import test from 'node:test';
import { addChange, describeChange, detectStatusChange, newestFirst } from './statusChanges.js';

const now = new Date('2026-11-21T19:28:00Z');

test('a different status is a change, with what it was, what it is and when', () => {
  assert.deepEqual(detectStatusChange('Pending', 'Accepted', now), {
    from: 'Pending',
    to: 'Accepted',
    at: '2026-11-21T19:28:00.000Z',
  });
});

test('the same status is not a change', () => {
  assert.equal(detectStatusChange('Accepted', 'Accepted', now), null);
});

test('the first status the page sees is not a change', () => {
  assert.equal(detectStatusChange(undefined, 'Pending', now), null);
  assert.equal(detectStatusChange(null, 'Pending', now), null);
  assert.equal(detectStatusChange('', 'Pending', now), null);
});

test('a status that goes missing is not reported as a change', () => {
  assert.equal(detectStatusChange('Accepted', undefined, now), null);
  assert.equal(detectStatusChange('Accepted', '', now), null);
});

test('a change is described in a sentence', () => {
  assert.equal(describeChange({ from: 'Accepted', to: 'On the Way' }), 'Status changed from Accepted to On the Way');
});

test('each change is added to the end of the history, and newest shows first', () => {
  const first = detectStatusChange('Pending', 'Accepted', now);
  const second = detectStatusChange('Accepted', 'On the Way', now);
  const history = addChange(addChange([], first), second);

  assert.deepEqual(history.map((c) => c.to), ['Accepted', 'On the Way']);
  assert.deepEqual(newestFirst(history).map((c) => c.to), ['On the Way', 'Accepted']);
});

test('no change leaves the history as it was, and the history passed in is not changed', () => {
  const history = [detectStatusChange('Pending', 'Accepted', now)];
  const copy = JSON.parse(JSON.stringify(history));

  assert.equal(addChange(history, null), history);
  addChange(history, detectStatusChange('Accepted', 'Arrived', now));
  newestFirst(history);
  assert.deepEqual(history, copy);
});

test('a request can go through every status and each step is a change', () => {
  const path = ['Pending', 'Accepted', 'On the Way', 'Arrived', 'Completed'];
  let history = [];
  for (let i = 1; i < path.length; i += 1) {
    history = addChange(history, detectStatusChange(path[i - 1], path[i], now));
  }

  assert.deepEqual(history.map((c) => `${c.from}>${c.to}`), [
    'Pending>Accepted',
    'Accepted>On the Way',
    'On the Way>Arrived',
    'Arrived>Completed',
  ]);
});
