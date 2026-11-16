// Static campus data for the pilot area (Progress Campus, Blocks A, B and C).
// Everything here is mock data that mirrors the wireframes in the technical report.

const COL = { A: 70, B: 180, C: 290 };
const ROW = { 3: 50, 2: 105, 1: 160 };
const hubId = (block, floor) => `hub-${block.toLowerCase()}${floor}`;

/** Things a barrier can block. Edges reference these by id. */
export const FEATURES = {
  'elev-a': { label: 'Elevator – Block A' },
  'elev-b': { label: 'Elevator – Block B' },
  'elev-c': { label: 'Elevator – Block C' },
  'door-a-main': { label: 'Block A Main Entrance (automatic door)' },
  'ramp-b-east': { label: 'Block B East Entrance (ramp)' },
  'door-c-main': { label: 'Block C Main Entrance (automatic door)' },
  'bridge-ab': { label: 'Connecting bridge (Block A – Block B)' },
  'corr-bc': { label: 'Corridor (Block B – Block C)' },
};

const acc = (o = {}) => ({ elevator: true, stepFree: true, washroom: false, ramp: false, autoDoor: false, ...o });

const hubs = [];
for (const [block, floors] of [['A', [1, 2, 3]], ['B', [1, 2]], ['C', [1, 2]]]) {
  for (const f of floors) {
    hubs.push({
      id: hubId(block, f), name: `Block ${block}, Floor ${f} corridor`, block, floor: f,
      kind: 'hub', pos: { x: COL[block], y: ROW[f] }, acc: acc(),
    });
  }
}

// [id, name, block, floor, kind, description, acc overrides, distance from hub (m)]
const places = [
  ['a-bookstore', 'Campus Bookstore', 'A', 1, 'service', 'Textbooks, supplies and Centennial merchandise.', { washroom: true }, 20],
  ['a-a120', 'Accessibility Services (Room A120)', 'A', 1, 'service', 'Accommodations, assistive technology and accessibility support.', { washroom: true }, 25],
  ['a-counsel', 'Counselling Services (Room A135)', 'A', 1, 'service', 'Confidential personal and academic counselling.', {}, 35],
  ['a-a110', 'Room A110', 'A', 1, 'room', 'Lecture room, seats 60.', { elevator: false }, 30],
  ['a-elev', 'Elevator – Block A', 'A', 1, 'facility', 'Serves floors 1 to 3.', {}, 10],
  ['a-wash', 'Accessible Washroom – Block A, Floor 1', 'A', 1, 'facility', 'Step-free, automatic door, grab bars.', { washroom: true, autoDoor: true }, 15],
  ['a-main', 'Block A Main Entrance', 'A', 1, 'entrance', 'Main entrance with automatic doors.', { elevator: false, autoDoor: true }, 20],
  ['a-a210', 'Room A210', 'A', 2, 'room', 'Computer lab.', {}, 20],
  ['a-a301', 'Room A301', 'A', 3, 'room', 'Seminar room.', {}, 18],
  ['a-a318', 'Room A318', 'A', 3, 'office', 'Faculty office.', {}, 28],
  ['b-concourse', 'Block B Concourse', 'B', 1, 'facility', 'Main hall with ramps and elevator access.', { ramp: true, washroom: true }, 15],
  ['b-b101', 'Room B101', 'B', 1, 'room', 'Classroom.', { elevator: false }, 30],
  ['b-east', 'Block B East Entrance', 'B', 1, 'entrance', 'Ramp entrance.', { elevator: false, ramp: true }, 20],
  ['b-north', 'Block B North Entrance', 'B', 1, 'entrance', 'Stairs only. Not step-free.', { elevator: false, stepFree: false }, 20],
  ['b-hub', 'Student HUB', 'B', 2, 'service', 'Student services, lounge and event space.', { washroom: true, autoDoor: true }, 25],
  ['b-b210', 'Room B210', 'B', 2, 'office', 'Faculty office.', { washroom: false }, 22],
  ['b-b230', 'Room B230', 'B', 2, 'room', 'Event room, seats 120.', {}, 32],
  ['b-wash', 'Accessible Washroom – Block B, Floor 2', 'B', 2, 'facility', 'Step-free, automatic door.', { washroom: true, autoDoor: true }, 12],
  ['c-annex', 'Bookstore Annex', 'C', 1, 'service', 'Extra stock and course packs.', { washroom: true }, 22],
  ['c-main', 'Block C Main Entrance', 'C', 1, 'entrance', 'Main entrance with automatic doors.', { elevator: false, autoDoor: true }, 20],
  ['c-wash', 'Accessible Washroom – Block C, Floor 1', 'C', 1, 'facility', 'Step-free washroom.', { washroom: true }, 14],
  ['c-c202', 'Room C202', 'C', 2, 'room', 'Classroom.', {}, 26],
  ['c-c214', 'Room C214', 'C', 2, 'office', 'Faculty office.', {}, 30],
];

const placeNodes = places.map(([id, name, block, floor, kind, description, a, dist]) => ({
  id, name, block, floor, kind, description, acc: acc(a), attach: { hub: hubId(block, floor), dist },
}));

// Give each non-hub node a position near its hub (used by the map preview).
const slotCount = {};
const OFFS = [[-30, -16], [30, -16], [-30, 18], [30, 18], [0, -26], [0, 28]];
const placeNodesPos = placeNodes.map((n) => {
  const h = hubs.find((x) => x.id === n.attach.hub);
  const i = (slotCount[h.id] = (slotCount[h.id] ?? -1) + 1);
  if (n.kind === 'entrance') {
    const ex = { 'a-main': [-26, 55], 'b-east': [24, 55], 'b-north': [-26, 55], 'c-main': [0, 55] }[n.id];
    return { ...n, pos: { x: h.pos.x + ex[0], y: h.pos.y + ex[1] } };
  }
  const o = OFFS[i % OFFS.length];
  return { ...n, pos: { x: h.pos.x + o[0], y: h.pos.y + o[1] } };
});

export const NODES = [...hubs, ...placeNodesPos];

// [id, from, to, metres, type, feature]
const E = [];
const link = (id, a, b, d, type = 'walk', feature = null) => E.push({ id, a, b, dist: d, type, feature });
link('a12-el', 'hub-a1', 'hub-a2', 15, 'elevator', 'elev-a');
link('a12-st', 'hub-a1', 'hub-a2', 10, 'stairs');
link('a23-el', 'hub-a2', 'hub-a3', 15, 'elevator', 'elev-a');
link('a23-st', 'hub-a2', 'hub-a3', 10, 'stairs');
link('b12-el', 'hub-b1', 'hub-b2', 15, 'elevator', 'elev-b');
link('b12-st', 'hub-b1', 'hub-b2', 10, 'stairs');
link('c12-el', 'hub-c1', 'hub-c2', 15, 'elevator', 'elev-c');
link('c12-st', 'hub-c1', 'hub-c2', 10, 'stairs');
link('bridge-ab', 'hub-a2', 'hub-b2', 45, 'bridge', 'bridge-ab');
link('corr-bc', 'hub-b1', 'hub-c1', 40, 'walk', 'corr-bc');
link('outdoor-ab', 'a-main', 'b-east', 130, 'outdoor');
for (const n of placeNodes) {
  if (n.kind === 'entrance') {
    const t = { 'a-main': ['door', 'door-a-main'], 'b-east': ['ramp', 'ramp-b-east'], 'b-north': ['stairs', null], 'c-main': ['door', 'door-c-main'] }[n.id];
    link(`att-${n.id}`, n.attach.hub, n.id, n.attach.dist, t[0], t[1]);
  } else link(`att-${n.id}`, n.attach.hub, n.id, n.attach.dist);
}
export const EDGES = E;

export const QR_CODES = {
  'CA-HUB-01': 'b-hub',
  'CA-BOOKSTORE-01': 'a-bookstore',
  'CA-CONCOURSE-01': 'b-concourse',
  'CA-AMAIN-01': 'a-main',
  'CA-CMAIN-01': 'c-main',
};

export const EVENTS = [
  { id: 'ev1', name: 'Career Fair', placeId: 'b-b230', time: '10:00 AM' },
  { id: 'ev2', name: 'Career Fair Workshop', placeId: 'a-a110', time: '1:00 PM' },
  { id: 'ev3', name: 'Club Fair', placeId: 'b-hub', time: '11:30 AM' },
  { id: 'ev4', name: 'Open House Tour', placeId: 'c-annex', time: '2:30 PM' },
];

export const BARRIER_TYPES = ['Broken Elevator', 'Blocked Entrance', 'Construction Closure', 'Broken Door', 'Blocked Ramp', 'Other'];
export const ASSIST_TYPES = ['Standard Guiding', 'Mobility Assistance', 'Other'];

export const DIRECTORY_SEED = [
  { id: 'd1', kind: 'colleague', name: 'Prof. Dorothy Vaughan', dept: 'Mathematics', email: 'dvaughan@example.ca', placeId: 'a-a318' },
  { id: 'd2', kind: 'colleague', name: 'Prof. Katherine Johnson', dept: 'Computer Science', email: 'kjohnson@example.ca', placeId: 'c-c214' },
  { id: 'd3', kind: 'colleague', name: 'Dr. Jane Smith', dept: 'Engineering Technology', email: 'jsmith@example.ca', placeId: 'b-b210' },
  { id: 'd4', kind: 'colleague', name: 'Prof. Mary Jackson', dept: 'Software Engineering', email: 'mjackson@example.ca', placeId: 'a-a210' },
  { id: 'r1', kind: 'resource', name: 'Accessibility Services', dept: 'Student Services', email: 'accessibility@example.ca', placeId: 'a-a120' },
  { id: 'r2', kind: 'resource', name: 'Counselling Services', dept: 'Student Services', email: 'counselling@example.ca', placeId: 'a-counsel' },
  { id: 'r3', kind: 'resource', name: 'Bookstore', dept: 'Campus Retail', email: 'bookstore@example.ca', placeId: 'a-bookstore' },
  { id: 'r4', kind: 'resource', name: 'Student HUB', dept: 'Student Life', email: 'hub@example.ca', placeId: 'b-hub' },
];

export const DEMO_ACCOUNTS = [
  { email: 'student@campus.test', password: 'student123', role: 'user', name: 'Sam Student', active: true },
  { email: 'staff@campus.test', password: 'staff123', role: 'staff', name: 'Dr. Jane Smith', active: true },
  { email: 'alex@campus.test', password: 'helper123', role: 'helper', name: 'Alex Smith', active: true },
  { email: 'bea@campus.test', password: 'helper123', role: 'helper', name: 'Bea Okafor', active: true },
  { email: 'admin@campus.test', password: 'admin123', role: 'admin', name: 'Admin Avery', active: true },
];
