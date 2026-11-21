export function createHelpStore() {
  return { nextId: 1, requests: [] };
}

export function submitHelpRequest(store, input = {}) {
  const location = String(input.location ?? '').trim();
  if (!location) {
    return { ok: false, error: 'The request was not sent: choose your current location first.' };
  }

  const id = `REQ-${String(store.nextId).padStart(3, '0')}`;
  store.nextId += 1;
  const request = {
    id,
    location,
    description: String(input.description ?? '').trim(),
    type: input.type || 'Standard Guiding',
    ownerEmail: input.ownerEmail ?? null,
    ownerName: input.ownerName ?? 'Guest',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  store.requests.push(request);
  return { ok: true, id, request };
}

export function openHelpRequests(store) {
  return store.requests.filter((request) => request.status === 'pending');
}

const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

// The server sends its messages without a final period; show them as sentences.
const asSentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

// Story 18: ask the backend to accept a pending help request.
export const NO_HELPER_MESSAGE =
  'This device has no helper account set up, so a request cannot be accepted.';

export async function acceptHelpRequest(requestId, helperId) {
  if (!helperId) {
    return { ok: false, error: NO_HELPER_MESSAGE };
  }
  try {
    const res = await fetch(`${API_BASE}/api/help-requests/${requestId}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helperId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: asSentence(data.message || 'Unable to accept this request.'),
      };
    }
    return {
      ok: true,
      message: asSentence(data.message || 'Help request accepted successfully'),
      request: data.request,
    };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}

// Story 17: load pending requests for one campus block (A, B or C).
// Maps backend fields to what the screens use; `id` is the database _id.
export async function fetchPendingRequests(block) {
  try {
    const res = await fetch(`${API_BASE}/api/help-requests/pending?block=${encodeURIComponent(block)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.message || 'Unable to load open requests.' };
    }
    const requests = (data.requests ?? []).map((r) => ({
      id: r._id,
      currentLocation: r.currentLocation,
      location: r.currentLocation,
      need: r.assistanceType,
      description: r.description,
    }));
    return { ok: true, requests };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}

// Statuses after which a request no longer changes.
export const FINAL_STATUSES = ['Completed', 'Cancelled'];
export const isFinalStatus = (status) => FINAL_STATUSES.includes(status);

// Story 18: the Campus User checks their request, so they see when a helper accepts it.
export async function fetchRequestStatus(requestId) {
  if (!requestId) {
    return { ok: false, error: 'No request selected.' };
  }
  try {
    const res = await fetch(`${API_BASE}/api/help-requests/${encodeURIComponent(requestId)}/status`);
    const data = await res.json().catch(() => ({}));

    // The server answers 404 for an unknown request and 400 for a malformed id.
    if (res.status === 404 || res.status === 400) {
      return { ok: false, error: 'Request not found.' };
    }
    
    if (!res.ok || !data.request) {
      return { ok: false, error: 'Unable to load request status.' };
    }
    return { ok: true, request: data.request };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}
