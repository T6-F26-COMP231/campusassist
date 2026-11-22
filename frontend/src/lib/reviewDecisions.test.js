import assert from 'node:assert/strict';
import test from 'node:test';
import { approveReport, pendingCount } from './barrierReports.js';
import { mergePendingReports } from './pendingReports.js';
import { approveBarrierReport, rejectBarrierReport } from './reviewDecisions.js';

const withFetch = async (fake, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = fake;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
};

test('approving and rejecting send a PATCH to the report and report ok when it is saved', async () => {
  const calls = [];
  await withFetch(
    async (url, options) => {
      calls.push({ url, method: options.method });
      return { ok: true, json: async () => ({ success: true, report: { status: 'Approved' } }) };
    },
    async () => {
      assert.equal((await approveBarrierReport('507f1f77bcf86cd799439011')).ok, true);
      assert.equal((await rejectBarrierReport('507f1f77bcf86cd799439011')).ok, true);
    }
  );
  assert.match(calls[0].url, /\/api\/barrier-reports\/507f1f77bcf86cd799439011\/approve$/);
  assert.match(calls[1].url, /\/api\/barrier-reports\/507f1f77bcf86cd799439011\/reject$/);
  assert.deepEqual(calls.map((call) => call.method), ['PATCH', 'PATCH']);
});

test('a refused or unreachable save is not ok, so the report is not removed from the list', async () => {
  await withFetch(
    async () => ({ ok: false, json: async () => ({ success: false, message: 'Only pending reports can be approved or rejected.' }) }),
    async () => {
      assert.deepEqual(await approveBarrierReport('abc'), {
        ok: false,
        error: 'Only pending reports can be approved or rejected.',
      });
    }
  );

  await withFetch(
    async () => { throw new Error('offline'); },
    async () => {
      assert.deepEqual(await rejectBarrierReport('abc'), {
        ok: false,
        error: 'Could not reach the server. Please try again.',
      });
    }
  );

  assert.equal((await approveBarrierReport('')).ok, false);
});

test('a report approved here is not shown as pending again when the list is reloaded', () => {
  const pending = { id: 'a', status: 'Pending', typeLabel: 'Other' };
  const approved = approveReport([pending], 'a').reports;
  // The backend still returned it (for example, from just before the save).
  assert.equal(pendingCount(mergePendingReports(approved, [pending])), 0);
});