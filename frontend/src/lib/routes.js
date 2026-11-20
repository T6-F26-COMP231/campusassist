import { BOOKSTORE_TO_HUB, CONNECTIONS, PLACES } from './routeData.js';

// Walks recorded in the campus route data. A pair with no entry has no directions yet.
const ROUTES = [{ from: 'bookstore', to: 'student-hub', connectionIds: BOOKSTORE_TO_HUB }];

export const NO_ROUTE_MESSAGE = 'No directions are recorded for this route yet.';

// Places that have a recorded route, for the pickers.
export function routePlaces() {
  const ids = new Set(ROUTES.flatMap((route) => [route.from, route.to]));
  return PLACES.filter((place) => ids.has(place.id)).map(({ id, name }) => ({ id, name }));
}

// Step-by-step directions in walking order. Each step starts where the last one ended,
// the first starts at the start place and the last ends at the destination.
export function routeDirections(fromId, toId) {
  const from = PLACES.find((place) => place.id === fromId);
  const to = PLACES.find((place) => place.id === toId);

  if (!from || !to) {
    return { ok: false, error: 'Choose where you are and where you are going.' };
  }
  if (from.id === to.id) {
    return { ok: false, error: 'You are already at your destination.' };
  }

  const route = ROUTES.find((entry) => entry.from === from.id && entry.to === to.id);
  if (!route) {
    return { ok: false, error: NO_ROUTE_MESSAGE };
  }

  const connections = route.connectionIds.map((id) => CONNECTIONS.find((entry) => entry.id === id));
  const inOrder =
    connections.every(Boolean) &&
    connections[0].from === from.id &&
    connections.at(-1).to === to.id &&
    connections.every((connection, i) => i === 0 || connections[i - 1].to === connection.from);

  if (!inOrder) {
    return { ok: false, error: NO_ROUTE_MESSAGE };
  }

  return {
    ok: true,
    from: from.name,
    to: to.name,
    steps: connections.map((connection) => connection.text),
  };
}
