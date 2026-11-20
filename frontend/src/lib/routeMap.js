import {
  PAGE5_TRANSFORMS,
  PAGE_TRANSFORMS,
  PLAN_SIZE,
  R_FLOOR1_TRANSFORM,
} from './planTransforms.js';

// The floor plan page that draws a floor, or null when the plan does not cover it.
export function planPageForRouteFloor(floor) {
  if (['1', '2', '3', '4'].includes(floor)) return Number(floor);
  if (['5', '6', '8'].includes(floor)) return 5;
  return null;
}

function matrixFor(floor, building) {
  if (building === 'R' && floor === '1') return R_FLOOR1_TRANSFORM;
  if (['1', '2', '3', '4'].includes(floor)) return PAGE_TRANSFORMS[Number(floor)];
  return PAGE5_TRANSFORMS[floor] ?? null;
}

// One route leg placed on its floor plan page, in image pixels. Null when the plan has no page
// for that floor.
export function planLeg(leg, building) {
  const page = planPageForRouteFloor(leg.floor);
  const matrix = matrixFor(leg.floor, building);
  if (!page || !matrix) return null;
  const points = leg.points.map(({ lon, lat }) => ({
    x: lon * matrix[0][0] + lat * matrix[1][0] + matrix[2][0],
    y: lon * matrix[0][1] + lat * matrix[1][1] + matrix[2][1],
  }));
  return { page, floor: leg.floor, points, size: PLAN_SIZE };
}
