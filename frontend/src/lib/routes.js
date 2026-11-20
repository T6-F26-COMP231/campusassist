import { MAP_CONNECTORS, MAP_PLACES } from './mapPlaces.js';
import { WALK_FLOORS } from './walkMap.js';

// Directions come from the MazeMap Progress Campus map. The map draws the corridors, lobbies,
// stairs and elevators of every floor, so the shortest walk is searched over those walkable
// areas, on one floor or across floors by elevator or stairs. The steps and the line on the
// map both come from the same path.

export const NO_PATH_MESSAGE = 'The map shows no walkable route between these two places.';
export const NO_STEP_FREE_MESSAGE = 'No step-free route is available between these two places.';
export const NOT_ON_MAP_MESSAGE = 'One of these places is not connected to the walkable map.';

const BUILDINGS = [
  { id: 'A', label: 'A Block' },
  { id: 'BCDE', label: 'B, C, D & E Blocks' },
  { id: 'L', label: 'L Block (Ann Buller Learning Centre)' },
  { id: 'R', label: 'R Block (Centennial Place)' },
  { id: 'SCAWC', label: 'Student Centre & AWC' },
];

const PLACES = MAP_PLACES.map(([id, name, building, floor, lon, lat]) => ({
  id: String(id), name, building, floor, lon, lat,
}));
const BY_ID = new Map(PLACES.map((place) => [place.id, place]));

const FLOOR_ORDER = ['B', '1', '2', '3', '4', '5', '6', '7', '8'];
const floorRank = (floor) => FLOOR_ORDER.indexOf(floor);

// Every place on the map, grouped by building and sorted by floor then name, for the pickers.
export function routeGroups() {
  return BUILDINGS.map(({ id, label }) => ({
    id,
    label,
    places: PLACES.filter((place) => place.building === id)
      .sort((a, b) => floorRank(a.floor) - floorRank(b.floor) || a.name.localeCompare(b.name))
      .map(({ id: placeId, name, floor }) => ({ id: placeId, name, floor })),
  })).filter((group) => group.places.length > 0);
}

export function routePlaceCount() {
  return PLACES.length;
}

// ---- Map positions in metres -------------------------------------------------------------

const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320 * Math.cos((43.785 * Math.PI) / 180);

export function distanceMetres(a, b) {
  return Math.hypot((b.lon - a.lon) * M_PER_DEG_LON, (b.lat - a.lat) * M_PER_DEG_LAT);
}

const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];

// Bearing in degrees clockwise from north, from `a` to `b` (both in metres, y pointing north).
const bearing = (a, b) => ((Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI + 360) % 360;

export function compassDirection(a, b) {
  const degrees = bearing(
    { x: (a.lon) * M_PER_DEG_LON, y: a.lat * M_PER_DEG_LAT },
    { x: (b.lon) * M_PER_DEG_LON, y: b.lat * M_PER_DEG_LAT },
  );
  return COMPASS[Math.round(degrees / 45) % 8];
}

// ---- Walkable grid -----------------------------------------------------------------------

const CELL = 0.5; // metres per grid cell

let bounds = null;
function gridBounds() {
  if (bounds) return bounds;
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const shapes of Object.values(WALK_FLOORS)) {
    for (const [, rings] of shapes) {
      for (const ring of rings) {
        for (let i = 0; i < ring.length; i += 2) {
          minLon = Math.min(minLon, ring[i]); maxLon = Math.max(maxLon, ring[i]);
          minLat = Math.min(minLat, ring[i + 1]); maxLat = Math.max(maxLat, ring[i + 1]);
        }
      }
    }
  }
  const width = Math.ceil(((maxLon - minLon) * M_PER_DEG_LON) / CELL) + 4;
  const height = Math.ceil(((maxLat - minLat) * M_PER_DEG_LAT) / CELL) + 4;
  bounds = { minLon, maxLat, width, height, size: width * height };
  return bounds;
}

const toCell = (lon, lat) => {
  const b = gridBounds();
  return {
    cx: Math.floor(((lon - b.minLon) * M_PER_DEG_LON) / CELL) + 2,
    cy: Math.floor(((b.maxLat - lat) * M_PER_DEG_LAT) / CELL) + 2,
  };
};

// Centre of a cell as a map position.
const cellPoint = (cx, cy) => {
  const b = gridBounds();
  return {
    lon: b.minLon + ((cx - 2 + 0.5) * CELL) / M_PER_DEG_LON,
    lat: b.maxLat - ((cy - 2 + 0.5) * CELL) / M_PER_DEG_LAT,
  };
};

const rasters = new Map();

// A step-free search leaves the stairs out of the walkable ground, so no path can cross them.
let stepFreeMode = false;
const rasterKey = (floor) => (stepFreeMode ? `${floor}!` : floor);
const owners = new Map(); // floor -> building index + 1 for every walkable cell
const BUILDING_INDEX = Object.fromEntries(BUILDINGS.map((b, i) => [b.id, i + 1]));

// 1 where a person can walk on this floor. Shapes are filled with the even-odd rule, so holes
// stay empty; the result is widened by one cell so doorways and narrow joins stay connected.
function raster(floor) {
  const key = rasterKey(floor);
  if (rasters.has(key)) return rasters.get(key);
  const { width, height, size } = gridBounds();
  const filled = new Uint8Array(size);
  const owner = new Uint8Array(size);
  for (const [building, rings, kind] of WALK_FLOORS[floor] ?? []) {
    if (stepFreeMode && kind === 's') continue;
    const edges = [];
    let top = Infinity, bottom = -Infinity;
    for (const ring of rings) {
      const pts = [];
      for (let i = 0; i < ring.length; i += 2) {
        const { cx, cy } = toCell(ring[i], ring[i + 1]);
        pts.push([cx, cy]);
        top = Math.min(top, cy); bottom = Math.max(bottom, cy);
      }
      for (let i = 0; i < pts.length; i += 1) edges.push([pts[i], pts[(i + 1) % pts.length]]);
    }
    for (let cy = Math.max(0, top); cy <= Math.min(height - 1, bottom); cy += 1) {
      const y = cy + 0.5;
      const xs = [];
      for (const [[x1, y1], [x2, y2]] of edges) {
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let cx = Math.max(0, Math.round(xs[k])); cx < Math.min(width, Math.round(xs[k + 1])); cx += 1) {
          filled[cy * width + cx] = 1;
          owner[cy * width + cx] = BUILDING_INDEX[building];
        }
      }
    }
  }
  const walk = new Uint8Array(size);
  for (let cy = 1; cy < height - 1; cy += 1) {
    for (let cx = 1; cx < width - 1; cx += 1) {
      const i = cy * width + cx;
      walk[i] = filled[i] || filled[i - 1] || filled[i + 1] || filled[i - width] || filled[i + width] ? 1 : 0;
      if (walk[i] && !owner[i]) owner[i] = owner[i - 1] || owner[i + 1] || owner[i - width] || owner[i + width];
    }
  }
  rasters.set(key, walk);
  owners.set(key, owner);
  return walk;
}

// The walkable cell closest to a map position, within `limit` metres.
function nearestWalkable(floor, lon, lat, limit) {
  const { width, height } = gridBounds();
  const walk = raster(floor);
  const { cx, cy } = toCell(lon, lat);
  const reach = Math.ceil(limit / CELL);
  let best = null;
  for (let y = Math.max(0, cy - reach); y <= Math.min(height - 1, cy + reach); y += 1) {
    for (let x = Math.max(0, cx - reach); x <= Math.min(width - 1, cx + reach); x += 1) {
      if (!walk[y * width + x]) continue;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= reach && (!best || dist < best.dist)) best = { x, y, dist };
    }
  }
  return best;
}

// ---- Elevators and stairs ----------------------------------------------------------------

// Elevators or stairs within 15 m of each other (on any floor) are one shaft.
function shafts(building, kind) {
  const found = [];
  MAP_CONNECTORS.filter((c) => c[0] === building && c[1] === kind).forEach(([, , floor, lon, lat]) => {
    const point = { floor, lon, lat };
    const shaft = found.find((s) => s.members.some((m) => distanceMetres(m, point) <= 15));
    if (shaft) shaft.members.push(point);
    else found.push({ members: [point] });
  });
  return found;
}

// Metres of walking an elevator ride or a flight of stairs is worth.
const RIDE_COST = { e: (floors) => 15 + 4 * floors, s: (floors) => 8 * floors };
const RIDE_NAME = { e: 'elevator', s: 'stairs' };
const RIDE_LABEL = { e: 'Elevator', s: 'Stairs' };

const linkCache = new Map();
function verticalLinks(avoidStairs) {
  if (linkCache.has(avoidStairs)) return linkCache.get(avoidStairs);
  const { size } = gridBounds();
  const links = new Map(); // node -> [{ to, cost, kind }]
  const add = (from, to, cost, kind) => {
    if (!links.has(from)) links.set(from, []);
    links.get(from).push({ to, cost, kind });
  };
  for (const { id: building } of BUILDINGS) {
    for (const kind of avoidStairs ? ['e'] : ['e', 's']) {
      for (const shaft of shafts(building, kind)) {
        const stops = [];
        for (const floor of [...new Set(shaft.members.map((m) => m.floor))].sort((a, b) => floorRank(a) - floorRank(b))) {
          if (!WALK_FLOORS[floor]) continue;
          const member = shaft.members.find((m) => m.floor === floor);
          const cell = nearestWalkable(floor, member.lon, member.lat, 4);
          if (cell) stops.push({ floor, node: floorRank(floor) * size + cell.y * gridBounds().width + cell.x });
        }
        for (let i = 0; i + 1 < stops.length; i += 1) {
          const gap = floorRank(stops[i + 1].floor) - floorRank(stops[i].floor);
          const cost = RIDE_COST[kind](gap);
          add(stops[i].node, stops[i + 1].node, cost, kind);
          add(stops[i + 1].node, stops[i].node, cost, kind);
        }
      }
    }
  }
  linkCache.set(avoidStairs, links);
  return links;
}

// ---- Shortest path -----------------------------------------------------------------------

class Heap {
  constructor() { this.keys = []; this.vals = []; }
  get size() { return this.keys.length; }
  push(key, val) {
    const { keys, vals } = this;
    let i = keys.length;
    keys.push(key); vals.push(val);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (keys[parent] <= key) break;
      keys[i] = keys[parent]; vals[i] = vals[parent]; i = parent;
    }
    keys[i] = key; vals[i] = val;
  }
  pop() {
    const { keys, vals } = this;
    const topKey = keys[0], topVal = vals[0];
    const key = keys.pop(), val = vals.pop();
    const n = keys.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let child = 2 * i + 1;
        if (child >= n) break;
        if (child + 1 < n && keys[child + 1] < keys[child]) child += 1;
        if (keys[child] >= key) break;
        keys[i] = keys[child]; vals[i] = vals[child]; i = child;
      }
      keys[i] = key; vals[i] = val;
    }
    return [topKey, topVal];
  }
}

const NEIGHBOURS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

function shortestPath(startNode, endNode, avoidStairs) {
  const { width, height, size } = gridBounds();
  const links = verticalLinks(avoidStairs);
  const dist = new Map();
  const prev = new Map();
  const via = new Map();
  const heap = new Heap();
  dist.set(startNode, 0);
  heap.push(0, startNode);
  while (heap.size > 0) {
    const [d, node] = heap.pop();
    if (d > (dist.get(node) ?? Infinity)) continue;
    if (node === endNode) break;
    const floor = FLOOR_ORDER[Math.floor(node / size)];
    const walk = raster(floor);
    const index = node % size;
    const cx = index % width;
    const cy = Math.floor(index / width);
    const relax = (next, cost, kind) => {
      const nd = d + cost;
      if (nd < (dist.get(next) ?? Infinity)) {
        dist.set(next, nd); prev.set(next, node);
        if (kind) via.set(next, kind); else via.delete(next);
        heap.push(nd, next);
      }
    };
    for (const [dx, dy, step] of NEIGHBOURS) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= width || y >= height || !walk[y * width + x]) continue;
      if (dx !== 0 && dy !== 0 && (!walk[cy * width + x] || !walk[y * width + cx])) continue;
      relax(node - index + y * width + x, step * CELL);
    }
    for (const link of links.get(node) ?? []) relax(link.to, link.cost, link.kind);
  }
  if (!dist.has(endNode)) return null;
  const nodes = [endNode];
  while (nodes[0] !== startNode) nodes.unshift(prev.get(nodes[0]));
  return { nodes, via, length: dist.get(endNode) };
}

// True when the straight line between two cells stays on walkable ground.
function clearLine(walk, width, a, b) {
  const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  for (let i = 1; i < steps; i += 1) {
    const x = Math.round(a.x + ((b.x - a.x) * i) / steps);
    const y = Math.round(a.y + ((b.y - a.y) * i) / steps);
    if (!walk[y * width + x]) return false;
  }
  return true;
}

// Cuts a cell-by-cell path down to the corners that matter.
// The cells in `forced` are always kept as corners.
function straighten(floor, cells, forced = []) {
  const { width } = gridBounds();
  const walk = raster(floor);
  const stops = [...forced, cells.length - 1].sort((a, b) => a - b);
  const kept = [cells[0]];
  let i = 0;
  for (const stop of stops) {
    while (i < stop) {
      let j = stop;
      while (j > i + 1 && !clearLine(walk, width, cells[i], cells[j])) j -= 1;
      kept.push(cells[j]);
      i = j;
    }
  }
  return kept;
}

// The campus bridge joins A Block and the B, C, D & E Blocks on the second floor. The map
// does not draw it as its own shape, so it is where the walkable area passes from one of
// those buildings to the other.
const BRIDGE_FLOOR = '2';
const BRIDGE_ENDS = {
  A: 'Block A',
  BCDE: 'the B, C, D & E Blocks',
};

// Where a leg of the path crosses the bridge: [{ index, text }], index being the first cell
// on the far side.
function bridgeCrossings(leg) {
  if (leg.floor !== BRIDGE_FLOOR) return [];
  const { width } = gridBounds();
  const owner = owners.get(rasterKey(leg.floor));
  const found = [];
  let before = 0;
  leg.cells.forEach((cell, index) => {
    const now = owner[cell.y * width + cell.x];
    if (!now) return;
    const a = BUILDINGS[before - 1]?.id;
    const b = BUILDINGS[now - 1].id;
    if (before && before !== now && BRIDGE_ENDS[a] && BRIDGE_ENDS[b]) {
      found.push({ index, text: `Cross the bridge from ${BRIDGE_ENDS[a]} to ${BRIDGE_ENDS[b]}` });
    }
    before = now;
  });
  return found;
}

// ---- Directions --------------------------------------------------------------------------

const metres = (m) => `${Math.max(5, Math.round(m / 5) * 5)} m`;
const floorName = (floor) => `Floor ${floor}`;
const asMetres = (p) => ({ x: p.lon * M_PER_DEG_LON, y: p.lat * M_PER_DEG_LAT });
const segmentLength = (a, b) => distanceMetres(a, b);

function turnWords(from, to) {
  let turn = ((to - from + 540) % 360) - 180; // -180..180, positive is a right turn
  const side = turn >= 0 ? 'right' : 'left';
  turn = Math.abs(turn);
  if (turn < 25) return 'Continue straight';
  if (turn < 60) return `Bear ${side}`;
  if (turn < 135) return `Turn ${side}`;
  return `Turn sharply ${side}`;
}

// Removes corners that add less than 3 m or hardly turn, so a step is never a tiny shuffle.
function simplifyPoints(points) {
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const before = bearing(asMetres(out.at(-1)), asMetres(points[i]));
    const after = bearing(asMetres(points[i]), asMetres(points[i + 1]));
    const turn = Math.abs(((after - before + 540) % 360) - 180);
    if (points[i].bridge || (segmentLength(out.at(-1), points[i]) >= 3 && turn >= 25)) out.push(points[i]);
  }
  out.push(points.at(-1));
  return out;
}

function computeRoute(fromId, toId, avoidStairs) {
  const from = BY_ID.get(String(fromId));
  const to = BY_ID.get(String(toId));

  if (!from || !to) {
    return { ok: false, error: 'Choose where you are and where you are going.' };
  }
  if (from.id === to.id) {
    return { ok: false, error: 'You are already at your destination.' };
  }
  if (!WALK_FLOORS[from.floor] || !WALK_FLOORS[to.floor]) {
    return { ok: false, error: NOT_ON_MAP_MESSAGE };
  }

  const { width, size } = gridBounds();
  const start = nearestWalkable(from.floor, from.lon, from.lat, 40);
  const end = nearestWalkable(to.floor, to.lon, to.lat, 40);
  if (!start || !end) {
    return { ok: false, error: NOT_ON_MAP_MESSAGE };
  }
  const startNode = floorRank(from.floor) * size + start.y * width + start.x;
  const endNode = floorRank(to.floor) * size + end.y * width + end.x;
  const found = shortestPath(startNode, endNode, avoidStairs);
  if (!found) {
    return { ok: false, error: NO_PATH_MESSAGE };
  }

  // Split the path into one leg per floor, with the elevator or stairs between them.
  const legs = [];
  const rides = [];
  let current = null;
  found.nodes.forEach((node) => {
    const floor = FLOOR_ORDER[Math.floor(node / size)];
    const index = node % size;
    const cell = { x: index % width, y: Math.floor(index / width) };
    if (!current || current.floor !== floor) {
      if (current) rides.push({ kind: found.via.get(node), from: current.floor, to: floor });
      current = { floor, cells: [] };
      legs.push(current);
    }
    current.cells.push(cell);
  });

  // A ride that stops on a floor without walking there is one ride.
  for (let i = 1; i < legs.length - 1; i += 1) {
    if (legs[i].cells.length === 1 && rides[i - 1].kind === rides[i].kind) {
      rides[i - 1].to = rides[i].to;
      legs.splice(i, 1);
      rides.splice(i, 1);
      i -= 1;
    }
  }

  const mapLegs = legs.map((leg, i) => {
    raster(leg.floor);
    const crossings = bridgeCrossings(leg);
    const bridgeAt = new Map(crossings.map((c) => [leg.cells[c.index], c.text]));
    const corners = straighten(leg.floor, leg.cells, crossings.map((c) => c.index)).map((cell) => {
      const point = cellPoint(cell.x, cell.y);
      if (bridgeAt.has(cell)) point.bridge = bridgeAt.get(cell);
      return point;
    });
    const first = i === 0 ? { lon: from.lon, lat: from.lat } : corners[0];
    const last = i === legs.length - 1 ? { lon: to.lon, lat: to.lat } : corners.at(-1);
    const points = [first, ...corners.slice(1, -1), last];
    return { floor: leg.floor, points: points.length > 1 ? simplifyPoints(points) : points };
  });

  const steps = [`Start at ${from.name} on ${floorName(from.floor)}`];
  let total = 0;
  let heading = null;
  mapLegs.forEach((leg, i) => {
    const pts = leg.points;
    for (let k = 0; k + 1 < pts.length; k += 1) {
      const length = segmentLength(pts[k], pts[k + 1]);
      if (length < 0.5) continue;
      total += length;
      const next = bearing(asMetres(pts[k]), asMetres(pts[k + 1]));
      const lastStep = i === mapLegs.length - 1 && k + 2 === pts.length;
      const endsAtBridge = Boolean(pts[k + 1].bridge);
      const target = lastStep
        ? ` to ${to.name}`
        : endsAtBridge
          ? ' to the bridge'
          : k + 2 === pts.length && i < rides.length ? ` to the ${RIDE_NAME[rides[i].kind]}` : '';
      const fresh = k === 0 || heading === null;
      if (fresh) {
        steps.push(`Walk ${metres(length)} ${COMPASS[Math.round(next / 45) % 8]}${target}`);
      } else {
        const turn = turnWords(heading, next);
        steps.push(target ? `${turn}, ${metres(length)}${target}` : `${turn}, walk ${metres(length)}`);
      }
      heading = next;
      if (endsAtBridge) {
        steps.push(pts[k + 1].bridge);
        heading = null;
      }
    }
    if (i < rides.length) {
      const ride = rides[i];
      steps.push(`${RIDE_LABEL[ride.kind]}: ${floorName(ride.from)} → ${floorName(ride.to)}`);
      heading = null;
    }
  });
  steps.push(`Arrive at ${to.name}`);

  return {
    ok: true,
    from: from.name,
    to: to.name,
    steps,
    legs: mapLegs,
    fromBuilding: from.building,
    totalMetres: Math.round(total),
    minutes: Math.max(1, Math.round(total / 72)),
  };
}

// Runs `work` with the stairs either left in or out of the walkable ground.
function withStairs(avoidStairs, work) {
  stepFreeMode = avoidStairs;
  try {
    return work();
  } finally {
    stepFreeMode = false;
  }
}

// Directions from one place to another. With `avoidStairs` the route is step-free: it never
// uses stairs, only corridors and elevators. The result says how much longer a step-free route
// is, and when none exists it says whether a route with stairs does.
export function routeDirections(fromId, toId, options = {}) {
  const avoidStairs = Boolean(options.avoidStairs);
  const result = withStairs(avoidStairs, () => computeRoute(fromId, toId, avoidStairs));

  if (!avoidStairs) {
    return result.ok ? { ...result, stepFree: false, usesStairs: result.steps.some((step) => /stairs/i.test(step)) } : result;
  }

  const usual = withStairs(false, () => computeRoute(fromId, toId, false));
  if (!result.ok) {
    return result.error === NO_PATH_MESSAGE && usual.ok
      ? { ok: false, error: NO_STEP_FREE_MESSAGE, stairsRouteExists: true }
      : result;
  }
  const extra = usual.ok ? result.totalMetres - usual.totalMetres : 0;
  return { ...result, stepFree: true, usesStairs: false, extraMetres: extra >= 5 ? extra : 0 };
}
