// Story 11: the saved conversation of one help request, loaded from the backend so the Campus User
// still sees their messages after the page is reloaded.
const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

export const LOAD_FAILED_MESSAGE = 'Messages could not be loaded.';

// An ISO time, or now when the server sent none that can be read.
const isoOf = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
};

const timeOf = (message) => {
  const time = new Date(message?.sentAt).getTime();
  return Number.isFinite(time) ? time : 0;
};

// GET /api/help-requests/:id/messages. The server sends every message of the request, oldest first,
// as { id, requestId, senderRole, senderId, text, sentAt }. The status page lists the messages the
// Campus User wrote, in the { id, text, sentAt } shape the page already uses.
export async function fetchMessages(requestId, fetchImpl = globalThis.fetch) {
  if (!requestId) return { ok: false, error: LOAD_FAILED_MESSAGE };

  try {
    const response = await fetchImpl(
      `${API_BASE}/api/help-requests/${encodeURIComponent(requestId)}/messages`
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success || !Array.isArray(data.messages)) {
      return { ok: false, error: LOAD_FAILED_MESSAGE };
    }

    const messages = data.messages
      .filter(
        (message) =>
          message &&
          message.senderRole === 'campus-user' &&
          typeof message.text === 'string' &&
          message.text.trim() !== ''
      )
      .map((message) => ({
        id: String(message.id),
        text: message.text,
        sentAt: isoOf(message.sentAt),
      }));

    return { ok: true, messages };
  } catch {
    return { ok: false, error: LOAD_FAILED_MESSAGE };
  }
}

// The saved messages, plus any message on screen that the server list does not have yet (one sent
// while the list was loading). A message is counted once, by its id, and the thread is oldest first.
export function mergeMessages(loaded = [], current = []) {
  const known = new Set(loaded.map((message) => message.id));
  const unsaved = current.filter((message) => !known.has(message.id));

  return [...loaded, ...unsaved].sort((a, b) => timeOf(a) - timeOf(b));
}

// A failed load keeps the messages already on screen and returns its own message.
// A saved load merges the server list with those messages and clears the failure.
export function applyLoadedMessages(result, current = []) {
  const kept = Array.isArray(current) ? current : [];
  if (!result?.ok) {
    return { messages: kept, error: result?.error || LOAD_FAILED_MESSAGE };
  }
  return { messages: mergeMessages(result.messages, kept), error: '' };
}