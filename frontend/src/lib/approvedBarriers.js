const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

export const BARRIERS_UNAVAILABLE_MESSAGE =
  'Approved barriers could not be loaded. Please check again shortly.';

// Locations of barriers an administrator has approved. Pending reports are not included.
export async function approvedBarrierLocations(fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(`${API_BASE}/api/barrier-reports/approved`);
  if (!response.ok) {
    throw new Error(BARRIERS_UNAVAILABLE_MESSAGE);
  }

  const data = await response.json();
  if (!data?.success || !Array.isArray(data.reports)) {
    throw new Error(BARRIERS_UNAVAILABLE_MESSAGE);
  }

  return data.reports
    .map((report) => report.location)
    .filter((location) => typeof location === 'string' && location.trim());
}
