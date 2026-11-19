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

const API_BASE = import.meta.env?.VITE_API_URL ?? '';

// Story 18: ask the backend to accept a pending help request.
export async function acceptHelpRequest(requestId, helperId) {
  try {
    const res = await fetch(`${API_BASE}/api/help-requests/${requestId}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helperId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.message || 'Unable to accept this request.' };
    }
    return { ok: true, request: data.request };
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
      location: r.currentLocation,
      need: r.assistanceType,
      description: r.description,
    }));
    return { ok: true, requests };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}
