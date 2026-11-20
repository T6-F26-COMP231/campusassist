import { CONNECTIONS } from './routeData.js';

// Story 7 - Issue #57
// Identify accessibility-related connections
// in the existing campus route data.

export function identifyRouteFeatures() {
  const elevators = CONNECTIONS.filter(
    (connection) => connection.kind === 'elevator'
  );

  const stairs = CONNECTIONS.filter(
    (connection) => connection.kind === 'stairs'
  );

  const ramps = CONNECTIONS.filter(
    (connection) => connection.kind === 'ramp'
  );

  return {
    elevators,
    stairs,
    ramps
  };
}

// Check whether a recorded connection uses stairs.
export function usesStairs(connection) {
  return connection.kind === 'stairs';
}

// Return connections that do not contain recorded stairs.
export function getStepFreeConnections() {
  return CONNECTIONS.filter(
    (connection) => !usesStairs(connection)
  );
}
