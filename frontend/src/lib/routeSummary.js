// Short wording for the Get Directions screen.

// "A1-51 · Floor 1" in the From and To lists.
export const placeOption = ({ name, floor }) => `${name} · Floor ${floor}`;

// "137 m · 2 min" for a route that was found.
export const distanceAndTime = (route) => `${route.totalMetres} m · ${route.minutes} min`;

// "52 m longer than the stairs route" for a step-free route that is longer, otherwise nothing.
export function extraDistance(route) {
  return route?.stepFree && route.extraMetres > 0
    ? `${route.extraMetres} m longer than the stairs route`
    : '';
}

// What the screen says about stairs: the chip on a route.
export const stairsChip = (route) => (route.stepFree ? 'No stairs' : route.usesStairs ? 'Uses stairs' : '');

// The floors a route visits, in order, labelled so that a floor visited twice can be told apart
// ("1. Floor 1" and "3. Floor 1"). A route on one floor needs no label.
export function floorLabels(legs) {
  const floors = legs.map((leg) => leg.floor);
  const repeated = new Set(floors).size !== floors.length;
  return floors.map((floor, i) => (repeated ? `${i + 1}. Floor ${floor}` : `Floor ${floor}`));
}
