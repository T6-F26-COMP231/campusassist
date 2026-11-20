
import {
  locateRoom,
  FLOOR_PLAN_TITLES,
  NOT_ON_PLAN_MESSAGE
} from './floorPlan.js';
import { PLACES } from './routeData.js';

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

// Story 19: Room lookup and step-free routing support.
export function directionSteps(location, options = {}) {
  if (options.stepFree) {
    return stepFreeRoute(location);
  }

  const place = placeName(location);

  if (!place) {
    return {
      ok: false,
      error: 'This request has no location to walk to.'
    };
  }

  const room = locateRoom(place);

  if (!room) {
    // Preserve the original directions behaviour for
    // legacy room names such as "Room B210".
    if (/^Room\s+[A-Za-z]\d+/i.test(place)) {
      return {
        ok: true,
        location: place,
        steps: [
          'Start from your current position.',
          `Walk toward ${place}.`,
          `Arrive at ${place}.`
        ]
      };
    }

    const recordedPlace = PLACES.find(
      (entry) =>
        entry.id.toLowerCase() === place.toLowerCase() ||
        entry.name.toLowerCase() === place.toLowerCase()
    );

    if (recordedPlace) {
      return {
        ok: true,
        location: recordedPlace.name,
        steps: [
          'Start from your current position.',
          `Walk toward ${recordedPlace.name}.`,
          `Arrive at ${recordedPlace.name}.`
        ]
      };
    }

    return {
      ok: false,
      error: NOT_ON_PLAN_MESSAGE
    };
  }

  const floorName = FLOOR_PLAN_TITLES[room.page];

  return {
    ok: true,
    location: room.code,
    page: room.page,
    spots: room.spots,
    steps: [
      `Open the ${floorName} Progress Campus floor plan.`,
      `Find room ${room.code} on the map.`,
      `Use the room's marked position to locate the destination.`
    ]
  };
}
