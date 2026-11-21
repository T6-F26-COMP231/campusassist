// Barrier reports as the Administrator sees them. A new report is Pending until it is reviewed.
export const REPORT_TABS = [
  { id: 'pending', label: 'Pending', statuses: ['Pending'] },
  { id: 'approved', label: 'Approved', statuses: ['Approved'] },
  { id: 'closed', label: 'Closed', statuses: ['Rejected', 'Resolved'] },
];

// "Report 001 · Broken Elevator"
export function reportTitle(report) {
  const number = String(report.id ?? '').replace(/^R-/, '');
  return `Report ${number} · ${report.typeLabel}`;
}

// Reports in one tab, in the order they arrived, so the oldest waiting report is first.
export function reportsForTab(reports, tabId) {
  const tab = REPORT_TABS.find((entry) => entry.id === tabId);
  if (!tab) return [];
  return reports.filter((report) => tab.statuses.includes(report.status ?? 'Pending'));
}

export function tabCounts(reports) {
  return Object.fromEntries(REPORT_TABS.map((tab) => [tab.id, reportsForTab(reports, tab.id).length]));
}

export const pendingCount = (reports) => reportsForTab(reports, 'pending').length;

export function emptyMessage(tabId) {
  return {
    pending: 'No reports are waiting.',
    approved: 'No approved reports yet.',
    closed: 'No closed reports yet.',
  }[tabId];
}

export const RESOLVE_BLOCKED_MESSAGE = 'Only approved barriers can be marked resolved.';
export const ALREADY_RESOLVED_MESSAGE = 'This barrier is already resolved.';
export const REPORT_NOT_FOUND_MESSAGE = 'That report was not found.';

// Only a barrier that has been approved can be marked resolved.
export const canResolve = (report) => report?.status === 'Approved';

// Marks one approved barrier as Resolved. Returns the new list, or why it could not be done.
// The list that was passed in is not changed.
export function resolveReport(reports, reportId) {
  const report = reports.find((entry) => entry.id === reportId);

  if (!report) return { ok: false, error: REPORT_NOT_FOUND_MESSAGE };
  if (report.status === 'Resolved') return { ok: false, error: ALREADY_RESOLVED_MESSAGE };
  if (!canResolve(report)) return { ok: false, error: RESOLVE_BLOCKED_MESSAGE };

  return {
    ok: true,
    report: { ...report, status: 'Resolved' },
    reports: reports.map((entry) => (entry.id === reportId ? { ...entry, status: 'Resolved' } : entry)),
  };
}
