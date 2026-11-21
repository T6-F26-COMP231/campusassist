// A Campus User writes to the helper who accepted their request.
export const MESSAGE_LIMIT = 300;

// A helper is assigned once the request is accepted, and stays assigned until it is closed.
export const MESSAGEABLE_STATUSES = ['Accepted', 'On the Way', 'Arrived'];

export const NO_HELPER_MESSAGE = 'You can message your helper once a helper accepts your request.';
export const CLOSED_MESSAGE = 'This request is closed, so messages can no longer be sent.';
export const EMPTY_MESSAGE = 'Write a message before sending.';
export const TOO_LONG_MESSAGE = `Keep the message to ${MESSAGE_LIMIT} characters or fewer.`;
export const SENT_MESSAGE = 'Message sent.';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

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
