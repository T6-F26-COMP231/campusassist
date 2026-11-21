import { BARRIER_TYPES } from './barriers.js';

const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

export const LOAD_FAILED_MESSAGE = 'Unable to load pending barrier reports.';
export const NO_ACCESS_MESSAGE = 'You do not have access to these reports.';
export const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Please try again.';

// The server sends its messages without a final period; show them as sentences.
const asSentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

// A report from the backend, in the shape the Barrier Reports screens use.
// `id` is the database _id. `number` is its last six characters, the same short form the
// open requests list uses, so the report title never shows a long database id.
export function toReport(saved) {
  const id = String(saved._id);
  const type = BARRIER_TYPES.find((entry) => entry.value === saved.type);

  return {
    id,
    number: id.slice(-6),
    status: saved.status ?? 'Pending',
    type: saved.type,
    typeLabel: type?.label ?? 'Barrier',
    location: saved.location ?? '',
    description: saved.description ?? '',
    photoName: saved.photoName ?? '',
    createdAt: saved.createdAt,
  };
}

// Story 24: load every pending barrier report from the backend, oldest first.
export async function fetchPendingReports() {
  try {
    const res = await fetch(`${API_BASE}/api/barrier-reports/pending`);
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: NO_ACCESS_MESSAGE };
    }
    if (!res.ok || data.success === false || !Array.isArray(data.reports)) {
      return { ok: false, error: data.message ? asSentence(data.message) : LOAD_FAILED_MESSAGE };
    }

    const reports = data.reports.filter((saved) => saved && saved._id).map(toReport);
    return { ok: true, reports };
  } catch {
    return { ok: false, error: NETWORK_ERROR_MESSAGE };
  }
}

// Puts the loaded reports into the list the screens share. The backend's order (oldest first)
// comes first. A report already in the list keeps its own copy, so one that was approved or
// rejected on this screen is not shown as pending again. Reports the backend did not return
// stay at the end, as they were.
export function mergePendingReports(existing, loaded) {
  const known = new Map(existing.map((report) => [report.id, report]));
  const returned = new Set(loaded.map((report) => report.id));

  return [
    ...loaded.map((report) => known.get(report.id) ?? report),
    ...existing.filter((report) => !returned.has(report.id)),
  ];
}