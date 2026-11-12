// Route engine: Dijkstra over the campus route map, with step-free and barrier-aware options.
import { NODES, EDGES, FEATURES } from './data.js';

const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const getNode = (id) => nodeMap[id];
export const places = NODES.filter((n) => n.kind !== 'hub');

const adj = new Map(NODES.map((n) => [n.id, []]));
for (const e of EDGES) {
  adj.get(e.a).push({ to: e.b, edge: e });
  adj.get(e.b).push({ to: e.a, edge: e });
}

const ELEVATOR_WAIT = 20; // metres-equivalent penalty so people prefer short stairs when allowed

/**
 * @param {string} from node id
 * @param {string} to node id
 * @param {{stepFree?: boolean, blocked?: string[]}} opts
 * @returns {null | {nodes: string[], legs: {edge: object, from: string, to: string}[], dist: number, minutes: number}}
 */
export function findRoute(from, to, { stepFree = false, blocked = [] } = {}) {
  if (!nodeMap[from] || !nodeMap[to]) return null;
  const block = new Set(blocked);
  const cost = new Map([[from, 0]]);
  const prev = new Map();
  const todo = new Set([from]);
  while (todo.size) {
    let cur = null;
    for (const id of todo) if (cur === null || cost.get(id) < cost.get(cur)) cur = id;
    todo.delete(cur);
    if (cur === to) break;
    for (const { to: nxt, edge } of adj.get(cur)) {
      if (stepFree && edge.type === 'stairs') continue;
      if (edge.feature && block.has(edge.feature)) continue;
      const c = cost.get(cur) + edge.dist + (edge.type === 'elevator' ? ELEVATOR_WAIT : 0);
      if (c < (cost.get(nxt) ?? Infinity)) {
        cost.set(nxt, c);
        prev.set(nxt, { from: cur, edge });
        todo.add(nxt);
      }
    }
  }
  if (from !== to && !prev.has(to)) return null;
  const legs = [];
  const nodes = [to];
  for (let at = to; at !== from; ) {
    const p = prev.get(at);
    legs.unshift({ edge: p.edge, from: p.from, to: at });
    nodes.unshift(p.from);
    at = p.from;
  }
  const dist = legs.reduce((s, l) => s + l.edge.dist, 0);
  const lifts = legs.filter((l) => l.edge.type === 'elevator').length;
  return { nodes, legs, dist, minutes: Math.max(1, Math.round(dist / 70 + lifts * 0.5)) };
}

/** Finds the route and tells whether verified barriers forced a detour. */
export function planRoute(from, to, { stepFree = false, blocked = [] } = {}) {
  const route = findRoute(from, to, { stepFree, blocked });
  const baseline = blocked.length ? findRoute(from, to, { stepFree, blocked: [] }) : route;
  const avoided = [];
  if (baseline && blocked.length) {
    for (const l of baseline.legs) {
      if (l.edge.feature && blocked.includes(l.edge.feature) && !avoided.includes(l.edge.feature)) avoided.push(l.edge.feature);
    }
  }
  return { route, rerouted: avoided.length > 0, avoided: avoided.map((f) => FEATURES[f].label) };
}

const blockName = (n) => `Block ${n.block}`;

/** Turns a route into human-readable, turn-by-turn steps (same format for everyone). */
export function describeRoute(route) {
  if (!route) return [];
  const steps = [];
  const start = nodeMap[route.nodes[0]];
  const end = nodeMap[route.nodes.at(-1)];
  steps.push({ icon: 'pin', text: `Start at ${start.name}.`, dist: 0 });
  let walk = 0;
  const flush = (upTo) => {
    if (!walk) return;
    const n = nodeMap[upTo];
    const label = n.kind === 'hub' ? `the ${blockName(n)}, Floor ${n.floor} corridor` : n.name;
    steps.push({ icon: 'arrow', text: `Walk to ${label} (${walk} m).`, dist: walk });
    walk = 0;
  };
  route.legs.forEach((l, i) => {
    const a = nodeMap[l.from];
    const b = nodeMap[l.to];
    const t = l.edge.type;
    if (t === 'walk' || t === 'outdoor') {
      if (t === 'outdoor') {
        flush(l.from);
        steps.push({ icon: 'arrow', text: `Follow the outdoor walkway to ${b.name} (${l.edge.dist} m).`, dist: l.edge.dist });
      } else walk += l.edge.dist;
      if (i === route.legs.length - 1) flush(l.to);
      return;
    }
    flush(l.from);
    if (t === 'elevator') steps.push({ icon: 'elevator', text: `Take the ${blockName(a)} elevator to Floor ${b.floor}.`, dist: l.edge.dist });
    else if (t === 'stairs' && (a.kind === 'entrance' || b.kind === 'entrance')) steps.push({ icon: 'door', text: a.kind === 'entrance' ? `Go up the steps from ${a.name}.` : `Take the steps to ${b.name}.`, dist: l.edge.dist, stairs: true });
    else if (t === 'stairs') steps.push({ icon: 'stairs', text: `Take the stairs ${b.floor > a.floor ? 'up' : 'down'} to Floor ${b.floor}.`, dist: l.edge.dist, stairs: true });
    else if (t === 'bridge') steps.push({ icon: 'arrow', text: `Cross the connecting bridge to ${blockName(b)}.`, dist: l.edge.dist });
    else if (t === 'door' || t === 'ramp') steps.push({ icon: 'door', text: a.kind === 'entrance' ? `Enter through the ${a.name}${t === 'ramp' ? ' (ramp)' : ''}.` : `Exit through the ${b.name}${t === 'ramp' ? ' (ramp)' : ''}.`, dist: l.edge.dist });
    if (i === route.legs.length - 1) flush(l.to);
  });
  steps.push({ icon: 'check', text: `Arrive at ${end.name}.`, dist: 0 });
  return steps;
}

/** Guess which route feature a barrier report is about, so admins start with a sensible default. */
export function guessFeature(type = '', location = '') {
  const t = `${type} ${location}`.toLowerCase();
  for (const [id, f] of Object.entries(FEATURES)) if (location.trim().toLowerCase() === f.label.toLowerCase()) return id;
  const block = /block\s*([abc])\b/.exec(t)?.[1];
  if (/elevator|lift/.test(t) && block) return `elev-${block}`;
  if (/bridge/.test(t)) return 'bridge-ab';
  if (/corridor/.test(t) && /\bb\b.*\bc\b|block b/.test(t)) return 'corr-bc';
  if (/entrance|door|ramp/.test(t)) {
    if (block === 'a' || /main entrance/.test(t) && !block) return 'door-a-main';
    if (block === 'b') return 'ramp-b-east';
    if (block === 'c') return 'door-c-main';
  }
  return null;
}
