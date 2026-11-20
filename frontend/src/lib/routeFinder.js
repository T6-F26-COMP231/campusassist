
import {
  CONNECTIONS,
  PLACES,
  CORRIDORS
} from './routeData.js';

import { verifiedCorridorForRoom } from './roomRoute.js';

// Story 19 - Task #35
// Find walking routes using recorded campus connections.

const locations = [...PLACES, ...CORRIDORS];

function resolveLocation(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const search = value.trim().toLowerCase();

  const match = locations.find(
    (location) =>
      location.id.toLowerCase() === search ||
      location.name.toLowerCase() === search
  );

  if (match) {
    return match.id;
  }

  return verifiedCorridorForRoom(value);
}

// Instructions for travelling in the opposite direction.
function reverseInstruction(connection) {
  const from = locations.find(
    (location) => location.id === connection.from
  );

  const to = locations.find(
    (location) => location.id === connection.to
  );

  if (!from || !to) {
    return null;
  }

  if (connection.kind === 'elevator') {
    return `Take the ${to.block || from.block} elevator to Floor ${from.floor}.`;
  }

  if (connection.kind === 'stairs') {
    return `Take the ${to.block || from.block} stairs to Floor ${from.floor}.`;
  }

  if (connection.id === 'leave-bookstore') {
    return 'Follow the Block B second-floor hallway to the Bookstore.';
  }

  if (connection.id === 'enter-hub') {
    return 'Leave the Student HUB and enter the Block C second-floor hallway.';
  }

  if (connection.id === 'hall-bc-2') {
    return 'Follow the second-floor corridor from Block C toward Block B.';
  }

  if (connection.kind === 'bridge') {
    return `Cross the bridge from Block ${to.block} to Block ${from.block}.`;
  }

  if (connection.kind === 'hallway') {
    return `Follow the recorded hallway from ${to.name} toward ${from.name}.`;
  }

  return null;
}

export function findWalkingRoute(
  startId,
  destinationId,
  options = {}
) {
  const { avoidStairs = false } = options;

  const start = resolveLocation(startId);
  const destination = resolveLocation(destinationId);

  if (!start || !destination) {
    return {
      ok: false,
      error: 'One or both locations are not in the campus route data.'
    };
  }

  if (start === destination) {
    return {
      ok: true,
      steps: ['You are already at your destination.']
    };
  }

  // Construct a graph from recorded campus connections.
  const graph = new Map();

  for (const location of locations) {
    graph.set(location.id, []);
  }

  for (const connection of CONNECTIONS) {
    if (avoidStairs && connection.kind === 'stairs') {
      continue;
    }

    if (
      !graph.has(connection.from) ||
      !graph.has(connection.to)
    ) {
      continue;
    }

    // Forward direction
    graph.get(connection.from).push({
      to: connection.to,
      text: connection.text
    });

    // Reverse direction
    const reverseText = reverseInstruction(connection);

    if (reverseText) {
      graph.get(connection.to).push({
        to: connection.from,
        text: reverseText
      });
    }
  }

  // Breadth-First Search
  const queue = [
    { location: start, steps: [] }
  ];

  const visited = new Set([start]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.location === destination) {
      return {
        ok: true,
        steps: current.steps
      };
    }

    for (const next of graph.get(current.location) || []) {
      if (!visited.has(next.to)) {
        visited.add(next.to);

        queue.push({
          location: next.to,
          steps: [...current.steps, next.text]
        });
      }
    }
  }

  return {
    ok: false,
    error: 'No recorded walking route is available between these locations.'
  };
}
