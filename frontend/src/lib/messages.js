// A Campus User writes to the helper who accepted their request.
export const MESSAGE_LIMIT = 300;

// A helper is assigned once the request is accepted, and stays assigned until it is closed.
export const MESSAGEABLE_STATUSES = ['Accepted', 'On the Way', 'Arrived'];

export const NO_HELPER_MESSAGE = 'You can message your helper once a helper accepts your request.';
export const CLOSED_MESSAGE = 'This request is closed, so messages can no longer be sent.';
export const EMPTY_MESSAGE = 'Write a message before sending.';
export const TOO_LONG_MESSAGE = `Keep the message to ${MESSAGE_LIMIT} characters or fewer.`;
export const SENT_MESSAGE = 'Message sent.';
export const DELIVERY_FAILED_MESSAGE = 'Message could not be delivered. Your message remains in the text box.';

const API_BASE = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

// The server sends some failures without a final period. Show each one as a sentence.
const asSentence = (value) => {
  const text = clean(value);
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

// Whether this request can be messaged now, and the reason when it cannot. A message cannot be
// written before a helper is assigned or after the request is completed or cancelled.
export function messagingState(request) {
  const status = request?.status;

  if (status === 'Completed' || status === 'Cancelled') {
    return { allowed: false, reason: CLOSED_MESSAGE };
  }
  if (!request || !request.helperId || !MESSAGEABLE_STATUSES.includes(status)) {
    return { allowed: false, reason: NO_HELPER_MESSAGE };
  }
  return { allowed: true, reason: '' };
}

// "I am at A3-74." from the location on the request, or nothing when it has none.
export function locationMessage(request) {
  const place = clean(request?.currentLocation);
  return place ? `I am at ${place}.` : '';
}

export function validateMessage(text) {
  const body = clean(text);

  if (body === '') return { ok: false, error: EMPTY_MESSAGE };
  if (body.length > MESSAGE_LIMIT) return { ok: false, error: TOO_LONG_MESSAGE };
  return { ok: true };
}

// Adds a message to the thread of one request. Returns the new thread, or why it was not sent.
// The thread that was passed in is not changed.
export function sendMessage(thread, request, text, now = new Date()) {
  const state = messagingState(request);
  if (!state.allowed) return { ok: false, error: state.reason };

  const check = validateMessage(text);
  if (!check.ok) return check;

  const message = {
    id: `${request._id ?? request.id ?? 'request'}-${thread.length + 1}`,
    text: clean(text),
    sentAt: now.toISOString(),
  };
  return { ok: true, message, messages: [...thread, message] };
}

// Story 11: save one message on the help request. The typed text stays in the box when this fails.
export async function deliverMessage(request, text, fetchImpl = globalThis.fetch) {
  const id = request?._id ?? request?.id;
  if (!id) return { ok: false, error: DELIVERY_FAILED_MESSAGE };

  try {
    const response = await fetchImpl(
      `${API_BASE}/api/help-requests/${encodeURIComponent(id)}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, senderRole: 'campus-user' }),
      }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success || !data.sentMessage?.text) {
      return { ok: false, error: asSentence(data.message) || DELIVERY_FAILED_MESSAGE };
    }

    const sentAt = data.sentMessage.sentAt
      ? new Date(data.sentMessage.sentAt).toISOString()
      : new Date().toISOString();

    return {
      ok: true,
      message: {
        id: String(data.sentMessage.id),
        text: data.sentMessage.text,
        sentAt,
      },
    };
  } catch {
    return { ok: false, error: DELIVERY_FAILED_MESSAGE };
  }
}

export const LOAD_FAILED_MESSAGE = 'Unable to load messages. Please try again.';
export const NO_USER_MESSAGES = 'No messages from the user yet.';

// Helper side: load what the Campus User has written on this request, oldest first.
// Replies written by the helper are left out of the "from the user" list.
export async function fetchRequestMessages(requestId, fetcher = fetch, apiBase = '') {
  if (!requestId) return { ok: false, error: 'No request selected.' };
  try {
    const res = await fetcher(`${apiBase}/api/help-requests/${encodeURIComponent(requestId)}/messages`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data.messages)) {
      return { ok: false, error: data.message || LOAD_FAILED_MESSAGE };
    }
    const messages = data.messages
      .filter((m) => m.senderRole !== 'helper')
      .map((m) => ({ id: m.id, text: m.text, sentAt: m.sentAt }));
    return { ok: true, messages };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}
