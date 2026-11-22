import { fetchPendingReports, toReport } from './pendingReports.js';

const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

export const APPROVED_LOAD_FAILED_MESSAGE = 'Unable to retrieve approved barrier reports.';

const asSentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

// Story 27: load the approved barriers from the backend, so an approved barrier can still be
// marked resolved after the app is reloaded. Returns { ok: true, reports } or { ok: false, error }.
export async function fetchApprovedReports() {
  try {
    const res = await fetch(`${API_BASE}/api/barrier-reports/approved/admin`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false || !Array.isArray(data.reports)) {
      return {
        ok: false,
        error: data.message ? asSentence(data.message) : APPROVED_LOAD_FAILED_MESSAGE,
      };
    }

    return { ok: true, reports: data.reports.filter((saved) => saved && saved._id).map(toReport) };
  } catch {
    return { ok: false, error: APPROVED_LOAD_FAILED_MESSAGE };
  }
}

// Loads what the Barrier Reports screen lists: pending reports first, then approved ones.
// Pending is required, so its error is passed on as before. A failed approved list keeps the
// pending reports and carries its own message.
export async function fetchReviewReports() {
  const [pending, approved] = await Promise.all([fetchPendingReports(), fetchApprovedReports()]);
  const approvedError = approved.ok ? '' : approved.error;

  if (!pending.ok) return { ...pending, approvedError };

  return {
    ok: true,
    reports: approved.ok ? [...pending.reports, ...approved.reports] : pending.reports,
    approvedError,
  };
}