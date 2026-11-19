export function directionSteps(location) {
  const place = typeof location === 'string' ? location.trim() : '';

  if (!place) {
    return {
      ok: false,
      error: 'This request has no location to walk to.',
    };
  }

  return {
    ok: true,
    location: place,
    steps: [
      'Start from your current position.',
      `Walk toward ${place}.`,
      `Arrive at ${place}.`,
    ],
  };
}
