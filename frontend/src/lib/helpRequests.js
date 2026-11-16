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
