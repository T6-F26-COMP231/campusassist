// Barrier reports as the Administrator sees them. A new report is Pending until it is reviewed.
export const REPORT_TABS = [
  { id: 'pending', label: 'Pending', statuses: ['Pending'] },
  { id: 'approved', label: 'Approved', statuses: ['Approved'] },
  { id: 'closed', label: 'Closed', statuses: ['Rejected', 'Resolved'] },
];

// Reports shown before any are stored on the server (the same two the user guide describes).
export const DEMO_REPORTS = [
  {
    id: 'R-001',
    status: 'Pending',
    type: 'broken-elevator',
    typeLabel: 'Broken Elevator',
    location: 'Block A, Elevator 2 near Cafeteria',
    description: '',
    photoName: '',
  },
  {
    id: 'R-002',
    status: 'Pending',
    type: 'blocked-entrance',
    typeLabel: 'Blocked Entrance',
    location: 'Block A Main Entrance',
    description: '',
    photoName: '',
  },
];

// "Report 003 · Broken Elevator"
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
    pending: 'No pending reports. Every report has been reviewed.',
    approved: 'No approved reports yet.',
    closed: 'No closed reports yet.',
  }[tabId];
}
