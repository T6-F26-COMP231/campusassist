import { FLOOR_PLAN_ROOMS } from './floorPlanRooms.js';

export const NOT_ON_PLAN_MESSAGE = 'That room is not on the Progress Campus floor plan.';

export const FLOOR_PLAN_TITLES = {
  1: 'First Floor',
  2: 'Second Floor',
  3: 'Third Floor',
  4: 'Fourth Floor',
  5: 'Fifth Floor and Up',
};

// Room code: block letter, floor digit, then the room (A3-74 = Block A, floor 3, room 74).
// Spaces around the hyphen are allowed ("C6 -44").
const ROOM_CODE = /\b([A-Za-z])(\d)\s*-\s*(\d{1,3}[A-Za-z]?)\b/;

// The plan has one page for floors 0-1 and one for floor 5 and up.
export function planPageForFloor(floor) {
  return floor <= 1 ? 1 : Math.min(floor, 5);
}

// Finds the room named in a request's location text on the floor plan.
// Returns { code, page, spots: [[x, y], ...] } (percent of the image), or null when
// the text has no room code or the plan has no such room. Nothing is guessed.
export function locateRoom(location) {
  const match = ROOM_CODE.exec(String(location ?? ''));
  if (!match) return null;
  const code = `${match[1].toUpperCase()}${match[2]}-${match[3].toUpperCase()}`;
  const page = planPageForFloor(Number(match[2]));
  const spots = FLOOR_PLAN_ROOMS[page]?.[code];
  return spots ? { code, page, spots } : null;
}
