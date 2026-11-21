import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBarrierReport } from './barriers.js';
import {
  ALREADY_RESOLVED_MESSAGE,
  REPORT_NOT_FOUND_MESSAGE,
  REPORT_TABS,
  RESOLVE_BLOCKED_MESSAGE,
  canResolve,
  emptyMessage,
  pendingCount,
  reportTitle,
  reportsForTab,
  resolveBarrierReport,
  resolveReport,
  tabCounts,
} from './barrierReports.js';

const report = (id, status, typeLabel = 'Broken Elevator') => ({ id, status, typeLabel });

test('the review screen has Pending, Approved and Closed tabs', () => {
  assert.deepEqual(REPORT_TABS.map((tab) => tab.label), ['Pending', 'Approved', 'Closed']);
});

test('with no reports submitted, nothing is pending and the list says so', () => {
  assert.equal(pendingCount([]), 0);
  assert.deepEqual(reportsForTab([], 'pending'), []);
  assert.deepEqual(tabCounts([]), { pending: 0, approved: 0, closed: 0 });
  assert.equal(emptyMessage('pending'), 'No reports are waiting.');
});

test('the Pending tab lists only reports that are still waiting', () => {
  const all = [
    report('R-001', 'Pending'),
    report('R-002', 'Approved'),
    report('R-003', 'Rejected'),
    report('R-004', 'Pending'),
    report('R-005', 'Resolved'),
  ];

  assert.deepEqual(reportsForTab(all, 'pending').map((r) => r.id), ['R-001', 'R-004']);
  assert.deepEqual(reportsForTab(all, 'approved').map((r) => r.id), ['R-002']);
  assert.deepEqual(reportsForTab(all, 'closed').map((r) => r.id), ['R-003', 'R-005']);
  assert.deepEqual(tabCounts(all), { pending: 2, approved: 1, closed: 2 });
});

test('every report is in exactly one tab, so none are missed', () => {
  const all = ['Pending', 'Approved', 'Rejected', 'Resolved'].map((status, i) => report(`R-00${i}`, status));
  const listed = REPORT_TABS.flatMap((tab) => reportsForTab(all, tab.id));

  assert.equal(listed.length, all.length);
  assert.equal(new Set(listed.map((r) => r.id)).size, all.length);
});

test('a report with no status counts as pending, and unknown tabs are empty', () => {
  assert.equal(pendingCount([{ id: 'R-009', typeLabel: 'Other' }]), 1);
  assert.deepEqual(reportsForTab([report('R-001', 'Pending')], 'nope'), []);
});

test('reports keep the order they arrived in', () => {
  const all = [report('R-001', 'Pending'), report('R-002', 'Pending'), report('R-003', 'Pending')];

  assert.deepEqual(reportsForTab(all, 'pending').map((r) => r.id), ['R-001', 'R-002', 'R-003']);
});

test('a report submitted from the form appears in the Pending list and is counted', () => {
  const sent = buildBarrierReport({ type: 'broken-elevator', location: 'Near room B230, Block B' }, 0);
  const all = [sent.report];

  assert.equal(sent.report.id, 'R-001');
  assert.equal(sent.report.status, 'Pending');
  assert.deepEqual(reportsForTab(all, 'pending').map((r) => r.id), ['R-001']);
  assert.equal(pendingCount(all), 1);
  assert.equal(reportTitle(sent.report), 'Report 001 \u00b7 Broken Elevator');
});

test('the badge counts only submitted reports that are still pending', () => {
  const first = buildBarrierReport({ type: 'broken-elevator', location: 'A Block' }, 0).report;
  const second = buildBarrierReport({ type: 'blocked-ramp', location: 'B Block' }, 1).report;
  const all = [first, { ...second, status: 'Approved' }];

  assert.equal(second.id, 'R-002');
  assert.equal(pendingCount(all), 1);
  assert.deepEqual(tabCounts(all), { pending: 1, approved: 1, closed: 0 });
});

test('no report is listed that was not submitted', () => {
  for (const tab of REPORT_TABS) {
    assert.deepEqual(reportsForTab([], tab.id), []);
  }
});

test('each tab has a message for when it is empty', () => {
  for (const tab of REPORT_TABS) {
    assert.ok(emptyMessage(tab.id).length > 0);
  }
});

test('only an approved barrier can be marked resolved', () => {
  assert.equal(canResolve(report('R-001', 'Approved')), true);
  for (const status of ['Pending', 'Rejected', 'Resolved']) {
    assert.equal(canResolve(report('R-001', status)), false, status);
  }
  assert.equal(canResolve(undefined), false);
});

test('marking an approved barrier resolved moves it to the Closed tab', () => {
  const all = [report('R-001', 'Approved'), report('R-002', 'Approved'), report('R-003', 'Pending')];
  const result = resolveReport(all, 'R-001');

  assert.equal(result.ok, true);
  assert.equal(result.report.status, 'Resolved');
  assert.deepEqual(reportsForTab(result.reports, 'closed').map((r) => r.id), ['R-001']);
  assert.deepEqual(reportsForTab(result.reports, 'approved').map((r) => r.id), ['R-002']);
  assert.equal(pendingCount(result.reports), 1);
});

test('resolving one barrier leaves every other report as it was, and the list untouched', () => {
  const all = [report('R-001', 'Approved'), report('R-002', 'Pending')];
  const copy = JSON.parse(JSON.stringify(all));
  const result = resolveReport(all, 'R-001');

  assert.deepEqual(all, copy);
  assert.deepEqual(result.reports[1], all[1]);
  assert.equal(result.reports.length, 2);
});

test('a barrier that is not approved cannot be marked resolved', () => {
  for (const status of ['Pending', 'Rejected']) {
    const result = resolveReport([report('R-001', status)], 'R-001');

    assert.equal(result.ok, false);
    assert.equal(result.error, RESOLVE_BLOCKED_MESSAGE);
  }
});

test('a barrier that is already resolved, or missing, gives a clear message', () => {
  assert.equal(resolveReport([report('R-001', 'Resolved')], 'R-001').error, ALREADY_RESOLVED_MESSAGE);
  assert.equal(resolveReport([report('R-001', 'Approved')], 'R-009').error, REPORT_NOT_FOUND_MESSAGE);
});

test('a resolved barrier cannot be resolved twice', () => {
  const once = resolveReport([report('R-001', 'Approved')], 'R-001');
  const twice = resolveReport(once.reports, 'R-001');

  assert.equal(twice.ok, false);
  assert.equal(twice.error, ALREADY_RESOLVED_MESSAGE);
});

test('Mark as Resolved calls the backend resolve route', async () => {
  const originalFetch = globalThis.fetch;
  let call;

  try {
    globalThis.fetch = async (url, options) => {
      call = { url, method: options.method };
      return {
        ok: true,
        json: async () => ({
          success: true,
          message: 'Barrier report marked resolved',
          report: { _id: '507f1f77bcf86cd799439011', status: 'Resolved' },
        }),
      };
    };

    const result = await resolveBarrierReport('507f1f77bcf86cd799439011');

    assert.equal(call.method, 'PATCH');
    assert.match(call.url, /\/api\/barrier-reports\/507f1f77bcf86cd799439011\/resolve$/);
    assert.equal(result.ok, true);
    assert.equal(result.report.status, 'Resolved');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Mark as Resolved shows the server failure on its own', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => ({
      ok: false,
      json: async () => ({ success: false, message: RESOLVE_BLOCKED_MESSAGE }),
    });

    const result = await resolveBarrierReport('507f1f77bcf86cd799439011');

    assert.equal(result.ok, false);
    assert.equal(result.error, RESOLVE_BLOCKED_MESSAGE);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Mark as Resolved says when the server cannot be reached', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => {
      throw new Error('network down');
    };

    const result = await resolveBarrierReport('507f1f77bcf86cd799439011');

    assert.equal(result.ok, false);
    assert.equal(result.error, 'Could not reach the server. Please try again.');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
