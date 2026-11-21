import { BARRIER_TYPES } from './barriers.js';

// Issue #82: load pending barrier reports from the backend and save approve/reject decisions there,
// so a reviewed report stays out of the Pending list after a reload.
const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

export const SAVE_FAILED_MESSAGE = 'The server could not be reached. The report was not changed.';

export const normalizeStatus = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

// A report from the backend, in the shape the review screen already uses.
export function fromServerReport(raw) {
  const id = String(raw._id ?? raw.id);
  const type = BARRIER_TYPES.find((entry) => entry.value === raw.type);
  const status = normalizeStatus(raw.status);

  return {
    id,
    number: id.slice(-6).toUpperCase(),
    status: status ? status[0].toUpperCase() + status.slice(1) : 'Pending',
    type: raw.type,
    typeLabel: type?.label ?? raw.type,
    location: raw.location,
    description: raw.description ?? '',
    photoName: raw.photoName ?? '',
  };
}

// Adds backend reports that are not in the list yet. Reports already in the list are left alone.
// The list that was passed in is not changed.
export function mergePendingReports(current, incoming) {
  const known = new Set(current.map((report) => report.id));
  const added = incoming
    .map(fromServerReport)
    .filter((report) => normalizeStatus(report.status) === 'pending' && !known.has(report.id));
  return added.length === 0 ? current : [...current, ...added];
}

export async function fetchPendingReports() {
  try {
    const res = await fetch(`${API_BASE}/api/barrier-reports/pending`);
    const data = await res.json();
    if (!res.ok || !data.success) return { ok: false, error: data.message || SAVE_FAILED_MESSAGE };
    return { ok: true, reports: data.reports };
  } catch {
    return { ok: false, error: SAVE_FAILED_MESSAGE };
  }
}

// decision is 'approved' or 'rejected'. Returns { ok: true } only when the backend saved it.
export async function saveReviewDecision(reportId, decision) {
  try {
    const res = await fetch(`${API_BASE}/api/barrier-reports/${encodeURIComponent(reportId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: decision }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { ok: false, error: data.message || SAVE_FAILED_MESSAGE };
    return { ok: true };
  } catch {
    return { ok: false, error: SAVE_FAILED_MESSAGE };
  }
}