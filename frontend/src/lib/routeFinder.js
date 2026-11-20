import { CONNECTIONS, PLACES, CORRIDORS } from './routeData.js';
import { verifiedCorridorForRoom } from './roomRoute.js';

// Story 19 - Task #35
// Find a walking route using the team's campus connections.

const locations = [...PLACES, ...CORRIDORS];

function resolveLocation(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const search = value.trim().toLowerCase();

  // First, check the team's recorded places and corridors.
  const match = locations.find(
    (location) =>
      location.id.toLowerCase() === search ||
      location.name.toLowerCase() === search
  );

  if (match) {
    return match.id;
  }

  // Only use a room's hallway when the connection is verified.
  return verifiedCorridorForRoom(value);
}

export function findWalkingRoute(startId, destinationId, options = {}) {
  const { avoidStairs = false } = options;

  const resolvedStart = resolveLocation(startId);
  const resolvedDestination = resolveLocation(destinationId);

  const startExists = Boolean(resolvedStart);
  const destinationExists = Boolean(resolvedDestination);

  startId = resolvedStart;
  destinationId = resolvedDestination;

  if (!startExists || !destinationExists) {
    return {
      ok: false,
      error: 'One or both locations are not in the campus route data.'
    };
  }

  if (startId === destinationId) {
    return {
      ok: true,
      steps: ['You are already at your destination.']
    };
  }

  // Use only recorded campus connections.
  const connections = avoidStairs
    ? CONNECTIONS.filter((connection) => connection.kind !== 'stairs')
    : CONNECTIONS;

  // Breadth-First Search (BFS)
  const queue = [
    { location: startId, steps: [] }
  ];

  const visited = new Set([startId]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.location === destinationId) {
      return {
        ok: true,
        steps: current.steps
      };
    }

    const nextConnections = connections.filter(
      (connection) => connection.from === current.location
    );

    for (const connection of nextConnections) {
      if (!visited.has(connection.to)) {
        visited.add(connection.to);

        queue.push({
          location: connection.to,
          steps: [
            ...current.steps,
            connection.text
          ]
        });
      }
    }
  }

  return {
    ok: false,
    error: 'No recorded walking route is available between these locations.'
  };
}
