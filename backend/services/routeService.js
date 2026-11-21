import Location from "../models/Location.js";

// Story 6 - Issue #60
// Calculate a walking route between two campus places.
//
// The campus map and pathfinder already exist in frontend/src/lib/routes.js (the same engine
// the Get Directions screen uses), so this service reuses them instead of copying the map.
// The engine is loaded on first use. If it cannot be loaded (for example, the backend is
// deployed without the frontend folder), only this endpoint reports "unavailable"; the rest
// of the server is not affected.

let enginePromise;

function loadEngine() {
  if (!enginePromise) {
    enginePromise = import("../../frontend/src/lib/routes.js").catch((error) => {
      enginePromise = undefined; // try again on the next request
      throw error;
    });
  }
  return enginePromise;
}

export const UNAVAILABLE_MESSAGE = "Route calculation is not available right now";
export const ALREADY_THERE_MESSAGE = "You are already at your destination";

const ROOM_CODE = /^[A-Z]\d-\d{1,3}[A-Z]?$/;

let placeCache;

// Every place on the campus map: { id, name, floor, building }.
async function campusPlaces(engine) {
  if (!placeCache) {
    placeCache = engine
      .routeGroups()
      .flatMap((group) =>
        group.places.map((place) => ({ ...place, building: group.id }))
      );
  }
  return placeCache;
}

// Looks a place up by map id, exact name, room code ("B2-02"), or the locationId of a record
// in the Locations collection (Story 2 search results). Never guesses.
// Returns { place } or { error: "unknown" | "ambiguous" }.
export async function resolvePlace(value, engine) {
  const places = await campusPlaces(engine);
  const text = String(value).trim();
  const lower = text.toLowerCase();

  const unique = (matches) => {
    if (matches.length === 1) return { place: matches[0] };
    return { error: matches.length === 0 ? "unknown" : "ambiguous" };
  };

  const byId = places.find((place) => place.id === text);
  if (byId) return { place: byId };

  const byName = places.filter((place) => place.name.toLowerCase() === lower);
  if (byName.length > 0) return unique(byName);

  const code = text.toUpperCase().replace(/\s+/g, "");
  if (ROOM_CODE.test(code)) {
    const byCode = places.filter((place) => {
      const name = place.name.toUpperCase();
      return name === code || name.endsWith(`(${code})`);
    });
    if (byCode.length > 0) return unique(byCode);
  }

  // Existing Location records (for example "student-hub") point at a map place by name.
  const record = await Location.findOne({ locationId: text }).lean();
  if (record?.name) {
    return unique(
      places.filter(
        (place) => place.name.toLowerCase() === String(record.name).toLowerCase()
      )
    );
  }

  return { error: "unknown" };
}

// Turns one instruction from the engine into a structured step.
export function describeStep(text, number) {
  const step = { step: number, instruction: text, type: "walk" };

  if (/^Start at /.test(text)) {
    step.type = "start";
  } else if (/^Arrive at /.test(text)) {
    step.type = "arrive";
  } else if (/^Cross the bridge/.test(text)) {
    step.type = "bridge";
  } else {
    const ride = /^(Elevator|Stairs): Floor (\S+) → Floor (\S+)$/.exec(text);
    if (ride) {
      step.type = ride[1].toLowerCase();
      step.fromFloor = ride[2];
      step.toFloor = ride[3];
    } else {
      const distance = /(\d+) m\b/.exec(text);
      if (distance) step.distanceMetres = Number(distance[1]);
    }
  }

  return step;
}

const summary = (place) => ({
  id: place.id,
  name: place.name,
  building: place.building,
  floor: place.floor
});

// Returns { ok: true, route } or { ok: false, status, error, stairsRouteExists? }.
export async function calculateRoute(from, to, { avoidStairs = false } = {}) {
  let engine;
  try {
    engine = await loadEngine();
  } catch (error) {
    console.error("Route engine could not be loaded:", error.message);
    return { ok: false, status: 503, error: UNAVAILABLE_MESSAGE };
  }

  const start = await resolvePlace(from, engine);
  if (!start.place) {
    return {
      ok: false,
      status: start.error === "ambiguous" ? 400 : 404,
      error:
        start.error === "ambiguous"
          ? "More than one place matches the start location. Use the place ID"
          : "The start location is not in the campus records"
    };
  }

  const end = await resolvePlace(to, engine);
  if (!end.place) {
    return {
      ok: false,
      status: end.error === "ambiguous" ? 400 : 404,
      error:
        end.error === "ambiguous"
          ? "More than one place matches the destination. Use the place ID"
          : "The destination is not in the campus records"
    };
  }

  const base = { from: summary(start.place), to: summary(end.place) };

  if (start.place.id === end.place.id) {
    return {
      ok: true,
      route: {
        ...base,
        alreadyAtDestination: true,
        message: ALREADY_THERE_MESSAGE,
        steps: [],
        totalSteps: 0,
        totalMetres: 0,
        minutes: 0,
        stepFree: Boolean(avoidStairs),
        usesStairs: false
      }
    };
  }

  const result = engine.routeDirections(start.place.id, end.place.id, {
    avoidStairs
  });

  if (!result.ok) {
    return {
      ok: false,
      status: 404,
      error: String(result.error).replace(/\.$/, ""),
      ...(result.stairsRouteExists ? { stairsRouteExists: true } : {})
    };
  }

  const steps = result.steps.map((text, index) => describeStep(text, index + 1));

  return {
    ok: true,
    route: {
      ...base,
      alreadyAtDestination: false,
      steps,
      totalSteps: steps.length,
      totalMetres: result.totalMetres,
      minutes: result.minutes,
      floors: result.legs.map((leg) => leg.floor),
      stepFree: result.stepFree,
      usesStairs: result.usesStairs,
      extraMetres: result.extraMetres ?? 0
    }
  };
}