// Story 19 / Issue #38: turns any directions result ({ ok, steps, error, ... }) into what the
// helper screen shows. It only reads the result, so it works with whatever generates the steps
// (the Issue #35 directions today, a map-based router later) and never produces an empty list.

export const NO_RESULT_MESSAGE = 'Directions are not available yet.';
export const NO_ROUTE_DATA_MESSAGE = 'No directions are available for this location yet.';

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export function directionView(result) {
  if (!result || typeof result !== 'object') {
    return { kind: 'none', message: NO_RESULT_MESSAGE };
  }

  if (!result.ok) {
    const message = typeof result.error === 'string' && result.error.trim();
    return { kind: 'error', message: message || NO_ROUTE_DATA_MESSAGE };
  }

  const steps = (Array.isArray(result.steps) ? result.steps : [])
    .filter((step) => typeof step === 'string' && step.trim() !== '')
    .map((step) => ({ text: step.trim(), stairs: /stair/i.test(step) }));

  if (steps.length === 0) {
    return { kind: 'error', message: NO_ROUTE_DATA_MESSAGE };
  }

  // Distance and time only when the route source provides them.
  const summary =
    isNumber(result.totalMetres) && isNumber(result.minutes)
      ? `About ${result.totalMetres} m, about ${result.minutes} ${result.minutes === 1 ? 'minute' : 'minutes'} on foot.`
      : '';

  return { kind: 'steps', steps, summary, stepFree: Boolean(result.stepFree) };
}