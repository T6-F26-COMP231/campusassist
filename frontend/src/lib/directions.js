
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

// Story 19: Return request-location directions.
export function directionSteps(location) {
  const place = placeName(location);

  if (!place) {
    return {
      ok: false,
      error: 'This request has no location to walk to.'
    };
  }

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
