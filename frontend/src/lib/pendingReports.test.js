import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOAD_FAILED_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  NO_ACCESS_MESSAGE,
  fetchPendingReports,
  mergePendingReports,
  toReport,
} from './pendingReports.js';
import { pendingCount, reportTitle, reportsForTab } from './barrierReports.js';

// What GET /api/barrier-reports/pending sends.
const saved = (id, type, location, extra = {}) => ({
  _id: id,
  type,
  location,
  description: '',
  photoName: '',
  status: 'Pending',
  createdAt: '2026-11-21T12:00:00.000Z',
  ...extra,
});

async function withFetch(stub, run) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

const reply = (status, body) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

test('a backend report has every field the screens show, with no undefined', () => {
  const report = toReport(saved('6740aa11bb22cc33dd44ee55', 'broken-elevator', 'Near room B230, Block B'));

  assert.equal(report.id, '6740aa11bb22cc33dd44ee55');
  assert.equal(report.status, 'Pending');
  assert.equal(report.typeLabel, 'Broken Elevator');
  assert.equal(report.location, 'Near room B230, Block B');
  assert.equal(report.description, '');
  assert.equal(reportTitle(report), 'Report 44ee55 \u00b7 Broken Elevator');
  assert.equal(Object.values(report).includes(undefined), false);
});

test('missing optional fields and an unknown type still give readable text', () => {
  const report = toReport({ _id: 'abc123def456', type: 'mystery', location: 'A Block' });

  assert.equal(report.typeLabel, 'Barrier');
  assert.equal(report.description, '');
  assert.equal(report.photoName, '');
  assert.equal(report.status, 'Pending');
});

test('loads the pending reports from the pending endpoint, in the order sent', async () => {
  let url;
  const result = await withFetch(
    async (requested) => {
      url = requested;
      return reply(200, {
        success: true,
        count: 2,
        reports: [
          saved('aaaaaaaaaaaaaaaaaaaaaa01', 'blocked-ramp', 'A2-65A'),
          saved('aaaaaaaaaaaaaaaaaaaaaa02', 'other', 'B Block'),
        ],
      })();
    },
    fetchPendingReports,
  );

  assert.match(url, /\/api\/barrier-reports\/pending$/);
  assert.equal(result.ok, true);
  assert.deepEqual(result.reports.map((r) => r.id), ['aaaaaaaaaaaaaaaaaaaaaa01', 'aaaaaaaaaaaaaaaaaaaaaa02']);
  assert.equal(pendingCount(result.reports), 2);
});

test('no pending reports is a normal empty result, not an error', async () => {
  const result = await withFetch(reply(200, { success: true, count: 0, reports: [] }), fetchPendingReports);

  assert.deepEqual(result, { ok: true, reports: [] });
});

test('a server error gives a clear message instead of throwing', async () => {
  const result = await withFetch(
    reply(500, { success: false, message: 'Unable to retrieve pending barrier reports' }),
    fetchPendingReports,
  );

  assert.deepEqual(result, { ok: false, error: 'Unable to retrieve pending barrier reports.' });
});

test('an unreachable server gives the same message the other screens use', async () => {
  const result = await withFetch(async () => { throw new TypeError('Failed to fetch'); }, fetchPendingReports);

  assert.deepEqual(result, { ok: false, error: NETWORK_ERROR_MESSAGE });
});

test('an unauthorized answer says access is not allowed', async () => {
  for (const status of [401, 403]) {
    const result = await withFetch(reply(status, {}), fetchPendingReports);
    assert.deepEqual(result, { ok: false, error: NO_ACCESS_MESSAGE });
  }
});

test('an answer without a reports list is treated as a failure', async () => {
  const result = await withFetch(reply(200, { success: true }), fetchPendingReports);

  assert.deepEqual(result, { ok: false, error: LOAD_FAILED_MESSAGE });
});

test('entries with no id are skipped', async () => {
  const result = await withFetch(
    reply(200, { success: true, reports: [{ type: 'other', location: 'x' }, saved('bbbbbbbbbbbbbbbbbbbbbb01', 'other', 'y')] }),
    fetchPendingReports,
  );

  assert.equal(result.reports.length, 1);
});

test('loaded reports fill an empty list in the order the backend sent them', () => {
  const loaded = [toReport(saved('c1', 'other', 'one')), toReport(saved('c2', 'other', 'two'))];

  assert.deepEqual(mergePendingReports([], loaded).map((r) => r.id), ['c1', 'c2']);
});

test('a report sent this visit is not listed twice and keeps its own details', () => {
  const sent = { id: 'c2', number: 'R-001', status: 'Pending', typeLabel: 'Other', location: 'two', roleLabel: 'Faculty Staff' };
  const loaded = [toReport(saved('c1', 'other', 'older')), toReport(saved('c2', 'other', 'two'))];

  const merged = mergePendingReports([sent], loaded);

  assert.deepEqual(merged.map((r) => r.id), ['c1', 'c2']);
  assert.equal(merged[1], sent);
  assert.equal(reportTitle(merged[1]), 'Report 001 \u00b7 Other');
});

test('a report approved on this screen is not shown as pending again after a reload', () => {
  const approved = { ...toReport(saved('c1', 'other', 'one')), status: 'Approved' };
  const loaded = [toReport(saved('c1', 'other', 'one')), toReport(saved('c2', 'other', 'two'))];

  const merged = mergePendingReports([approved], loaded);

  assert.deepEqual(reportsForTab(merged, 'pending').map((r) => r.id), ['c2']);
  assert.deepEqual(reportsForTab(merged, 'approved').map((r) => r.id), ['c1']);
});

test('reports the backend did not return stay in the list', () => {
  const closed = { id: 'gone', status: 'Rejected', typeLabel: 'Other', location: 'z' };
  const merged = mergePendingReports([closed], [toReport(saved('c1', 'other', 'one'))]);

  assert.deepEqual(merged.map((r) => r.id), ['c1', 'gone']);
});

test('merging does not change the list that was passed in', () => {
  const existing = [{ id: 'x', status: 'Pending', typeLabel: 'Other', location: 'a' }];
  mergePendingReports(existing, [toReport(saved('c1', 'other', 'one'))]);

  assert.equal(existing.length, 1);
});