import { placeIdForLocation, routeDirections } from './routes.js';

function placeName(location) {
  return typeof location === 'string' ? location.trim() : '';
}

function usesStairs(step) {
  return /stair/i.test(step);
}

// Recorded step-free walks from the existing main branch.
const STEP_FREE_ROUTES = [
  {
    name: 'Bookstore',
    steps: [
      'Start from your current position.',
      'Take the elevator to the second floor.',
      'Arrive at the Bookstore.',
    ],
  },
];

export function stepFreeRoute(location) {
  const place = placeName(location);

  if (!place) {
    return {
      ok: false,
      error: 'This request has no location to walk to.'
    };
  }

  const route = STEP_FREE_ROUTES.find(
    (entry) => entry.name.toLowerCase() === place.toLowerCase()
  );

  if (!route || route.steps.some(usesStairs)) {
    return {
      ok: false,
      error: 'No step-free route is available.'
    };
  }

  return {
    ok: true,
    location: route.name,
    steps: route.steps
  };
}

// Story 19 / Issue #35: Directions to the user's location, made by the same route generator as
// Get Directions (the Progress Campus walkable map), so the steps are real. A walk needs a start,
// so the caller passes where the helper is. Options: { from, stepFree, blocked }, where `from`
// is a map place (id, exact name, or full room code), `stepFree` avoids stairs, and `blocked`
// is a list of place ids an approved barrier keeps off the walk.
//
// Nothing is made up. Every refusal has a `code`, so a screen can tell the cases apart:
//   NO_LOCATION          the request has no location
//   LOCATION_NOT_ON_MAP  the location is not on the map (for example "A-02"; the map has "A1-02")
//   NO_START             the helper has not said where they are
//   START_NOT_ON_MAP     the helper's place is not on the map
//   NO_ROUTE             the map has no (step-free, unblocked) walk between the two places
export const NO_LOCATION_MESSAGE = 'This request has no location to walk to.';
export const NO_START_MESSAGE = 'Choose where you are to see the walk to the user.';

export const locationNotOnMapMessage = (location) =>
  `The user's location (${placeName(location)}) isn't on the map, so no route is available.`;

export const startNotOnMapMessage = (start) =>
  `Your starting place (${placeName(start)}) isn't on the map, so no route is available.`;

export function directionSteps(location, options = {}) {
  const { from, stepFree = false, blocked = [] } = options;

  const place = placeName(location);

  if (!place) {
    return {
      ok: false,
      code: 'NO_LOCATION',
      error: NO_LOCATION_MESSAGE
    };
  }

  // The map knows a place by its exact name, its id, or one full room code ("A1-51").
  const toId = placeIdForLocation(place);

  if (!toId) {
    return {
      ok: false,
      code: 'LOCATION_NOT_ON_MAP',
      notOnMap: true,
      location: place,
      error: locationNotOnMapMessage(place)
    };
  }

  const start = placeName(String(from ?? ''));

  if (!start) {
    return {
      ok: false,
      code: 'NO_START',
      location: place,
      error: NO_START_MESSAGE
    };
  }

  const fromId = placeIdForLocation(start);

  if (!fromId) {
    return {
      ok: false,
      code: 'START_NOT_ON_MAP',
      notOnMap: true,
      start,
      location: place,
      error: startNotOnMapMessage(start)
    };
  }

  const route = routeDirections(fromId, toId, {
    avoidStairs: Boolean(stepFree),
    blocked
  });

  if (!route.ok) {
    return { ...route, code: 'NO_ROUTE', location: place };
  }

  // The route as Get Directions returns it: steps, legs, totalMetres, minutes, stepFree, ...
  return { ...route, location: route.to };
}