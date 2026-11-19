
import {
  locateRoom,
  FLOOR_PLAN_TITLES,
  NOT_ON_PLAN_MESSAGE
} from './floorPlan.js';

// Task #35: Use the existing Progress Campus floor-plan system
export function directionSteps(location) {
  const place = typeof location === 'string'
    ? location.trim()
    : '';

  if (!place) {
    return {
      ok: false,
      error: 'This request has no location to walk to.'
    };
  }

  // Find the room using the existing campus floor-plan data
  const room = locateRoom(place);

  if (!room) {
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
