import { locateRoom } from './floorPlan.js';
import { CORRIDORS } from './routeData.js';

// Find the hallway node matching a room's block and floor.
// This does not confirm that the room opens onto that hallway.
export function candidateCorridorForRoom(location) {
  const room = locateRoom(location);

  if (!room) {
    return null;
  }

  const block = room.code.charAt(0);
  const floor = Number(room.code.charAt(1));

  const corridor = CORRIDORS.find(
    (entry) =>
      entry.block === block &&
      entry.floor === floor
  );

  return corridor?.id || null;
}

// Verified room-to-corridor connections.
// Add entries only after checking the official floor plan.
export const VERIFIED_ROOM_CONNECTIONS = {};

// Returns a hallway only when the connection is verified.
export function verifiedCorridorForRoom(location) {
  const room = locateRoom(location);

  if (!room) {
    return null;
  }

  return VERIFIED_ROOM_CONNECTIONS[room.code] || null;
}
