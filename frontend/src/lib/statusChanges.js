// The Campus User keeps the status page open while a helper works on their request. When a
// check finds a different status, the page tells them what changed and when.

// Returns the change between two statuses, or null when nothing changed. The first status the
// page sees is a starting point, not a change, so there is no change without a previous status.
export function detectStatusChange(previous, next, now = new Date()) {
  if (!previous || !next || previous === next) return null;
  return { from: previous, to: next, at: now.toISOString() };
}

// "Status changed from Pending to Accepted"
export const describeChange = (change) => `Status changed from ${change.from} to ${change.to}`;

// Adds a change to the history that was kept so far. Returns the history it was given when
// there is no change. The history passed in is not changed.
export function addChange(history, change) {
  return change ? [...history, change] : history;
}

// Newest first, for the list on the page.
export const newestFirst = (history) => [...history].reverse();
