import assert from 'node:assert/strict';
import test from 'node:test';
import { approveReport, pendingCount } from './barrierReports.js';
import {
  SAVE_FAILED_MESSAGE,
  fromServerReport,
  mergePendingReports,
  saveReviewDecision,
} from './barrierReportsApi.js';

const server = (_id, status = 'Pending') => ({
  _id, status, type: 'broken-elevator', location: 'Block B', description: '', photoName: '',
});

test('a backend report has the shape the review screen uses', () => {
  const report = fromServerReport(server('665f00000000000000000abc', ' pending '));
  assert.equal(report.id, '665f00000000000000000abc');
  assert.equal(report.status, 'Pending');
  assert.equal(report.typeLabel, 'Broken Elevator');
  assert.equal(report.number, '000ABC');
});

test('merging adds only reports that are not listed and ignores non-pending ones', () => {
  const current = [{ id: 'a', status: 'Approved', typeLabel: 'Other' }];
  const merged = mergePendingReports(current, [server('a'), server('b'), server('c', 'Rejected')]);
  assert.deepEqual(merged.map((r) => r.id), ['a', 'b']);
  assert.equal(current.length, 1);
  assert.equal(pendingCount(merged), 1);
});

test('a report that was approved locally is not brought back as pending by a refresh', () => {
  const current = approveReport([{ id: 'a', status: 'Pending', typeLabel: 'Other' }], 'a').reports;
  assert.equal(pendingCount(mergePendingReports(current, [server('a')])), 0);
});

test('a saved decision reports ok, and a refused or unreachable one reports the error', async () => {
  const original = globalThis.fetch;
  try {
    let call;
    globalThis.fetch = async (url, options) => {
      call = { url, options };
      return { ok: true, json: async () => ({ success: true }) };
    };
    assert.deepEqual(await saveReviewDecision('abc', 'approved'), { ok: true });
    assert.match(call.url, /\/api\/barrier-reports\/abc\/status$/);
    assert.equal(call.options.method, 'PATCH');
    assert.deepEqual(JSON.parse(call.options.body), { status: 'approved' });

    globalThis.fetch = async () => ({ ok: false, json: async () => ({ success: false, message: 'Nope' }) });
    assert.deepEqual(await saveReviewDecision('abc', 'rejected'), { ok: false, error: 'Nope' });

    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.deepEqual(await saveReviewDecision('abc', 'rejected'), { ok: false, error: SAVE_FAILED_MESSAGE });
  } finally {
    globalThis.fetch = original;
  }
});