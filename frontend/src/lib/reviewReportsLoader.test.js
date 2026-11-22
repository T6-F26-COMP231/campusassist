import assert from 'node:assert/strict';
import test from 'node:test';
import { APPROVED_LOAD_FAILED_MESSAGE, fetchReviewReports } from './reviewReportsLoader.js';

const pending = {
  _id: 'aaaaaaaaaaaaaaaaaaaaaa01',
  type: 'broken-elevator',
  location: 'Near room B230, Block B',
  description: '',
  photoName: '',
  status: 'Pending',
  createdAt: '2026-11-21T12:00:00.000Z',
};

async function withFetch(stub, run) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

test('a failed approved list keeps the pending reports and shows its own message', async () => {
  const result = await withFetch(async (url) => {
    if (String(url).endsWith('/api/barrier-reports/approved/admin')) {
      return {
        ok: false,
        status: 500,
        json: async () => ({ success: false, message: 'Unable to retrieve approved barrier reports' }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, reports: [pending] }),
    };
  }, fetchReviewReports);

  assert.equal(result.ok, true);
  assert.deepEqual(result.reports.map((report) => report.id), [pending._id]);
  assert.equal(result.approvedError, APPROVED_LOAD_FAILED_MESSAGE);
});

test('approved reports are added when that list loads', async () => {
  const approved = { ...pending, _id: 'bbbbbbbbbbbbbbbbbbbbbb02', status: 'Approved' };
  const result = await withFetch(async (url) => {
    const reports = String(url).endsWith('/approved/admin') ? [approved] : [pending];
    return { ok: true, status: 200, json: async () => ({ success: true, reports }) };
  }, fetchReviewReports);

  assert.equal(result.ok, true);
  assert.equal(result.approvedError, '');
  assert.deepEqual(result.reports.map((report) => report.status), ['Pending', 'Approved']);
});
