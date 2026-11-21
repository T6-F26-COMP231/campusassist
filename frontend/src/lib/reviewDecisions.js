import { REPORT_NOT_FOUND_MESSAGE } from './barrierReports.js';

const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

// Issue #82: ask the backend to save an approval or rejection, so the report stays out of the
// Pending list after a reload. Returns { ok: true } only when the backend saved it.
async function saveDecision(reportId, action, fallbackError) {
  if (!reportId) return { ok: false, error: REPORT_NOT_FOUND_MESSAGE };

  try {
    const response = await fetch(
      `${API_BASE}/api/barrier-reports/${encodeURIComponent(reportId)}/${action}`,
      { method: 'PATCH' }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return { ok: false, error: data.message || fallbackError };
    }

    return { ok: true, report: data.report, message: data.message };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}

// Story 25: approve a pending report.
export const approveBarrierReport = (reportId) =>
  saveDecision(reportId, 'approve', 'This report could not be approved.');

// Story 26: reject a pending report.
export const rejectBarrierReport = (reportId) =>
  saveDecision(reportId, 'reject', 'This report could not be rejected.');