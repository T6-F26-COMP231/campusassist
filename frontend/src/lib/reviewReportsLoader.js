import { fetchPendingReports, toReport } from './pendingReports.js';

const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

// Story 27: load the approved barriers from the backend, so an approved barrier can still be
// marked resolved after the app is reloaded. Returns { ok: true, reports } or { ok: false }.
export async function fetchApprovedReports() {
  try {
    const res = await fetch(`${API_BASE}/api/barrier-reports/approved/admin`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false || !Array.isArray(data.reports)) {
      return { ok: false };
    }

    return { ok: true, reports: data.reports.filter((saved) => saved && saved._id).map(toReport) };
  } catch {
    return { ok: false };
  }
}

// Loads what the Barrier Reports screen lists: pending reports first, then approved ones.
// Pending is required, so its error is passed on as before. Approved is added when it loads;
// if it cannot be loaded, the Pending tab still works and the Approved tab shows this visit's reports.
export async function fetchReviewReports() {
  const [pending, approved] = await Promise.all([fetchPendingReports(), fetchApprovedReports()]);

  if (!pending.ok) return pending;

  return { ok: true, reports: approved.ok ? [...pending.reports, ...approved.reports] : pending.reports };
}