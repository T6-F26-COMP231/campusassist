import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBarrierReport } from './barriers.js';
import {
  DEMO_REPORTS,
  REPORT_TABS,
  emptyMessage,
  pendingCount,
  reportTitle,
  reportsForTab,
  tabCounts,
} from './barrierReports.js';

const report = (id, status, typeLabel = 'Broken Elevator') => ({ id, status, typeLabel });

test('the review screen has Pending, Approved and Closed tabs', () => {
  assert.deepEqual(REPORT_TABS.map((tab) => tab.label), ['Pending', 'Approved', 'Closed']);
});

test('the sample data starts with Report 001 and Report 002, both pending', () => {
  assert.deepEqual(DEMO_REPORTS.map((r) => reportTitle(r)), [
    'Report 001 · Broken Elevator',
    'Report 002 · Blocked Entrance',
  ]);
  assert.equal(pendingCount(DEMO_REPORTS), 2);
  assert.equal(DEMO_REPORTS[0].location, 'Block A, Elevator 2 near Cafeteria');
  assert.equal(DEMO_REPORTS[1].location, 'Block A Main Entrance');
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

test('a report sent from the form joins the pending list as the next number', () => {
  const sent = buildBarrierReport(
    { type: 'broken-elevator', location: 'Near room B230, Block B' },
    DEMO_REPORTS.length,
  );
  const all = [...DEMO_REPORTS, sent.report];

  assert.equal(sent.report.id, 'R-003');
  assert.equal(sent.report.status, 'Pending');
  assert.equal(pendingCount(all), 3);
  assert.equal(reportTitle(sent.report), 'Report 003 · Broken Elevator');
});

test('each tab has a message for when it is empty', () => {
  for (const tab of REPORT_TABS) {
    assert.ok(emptyMessage(tab.id).length > 0);
  }
});
