// Progress Campus pilot route data, based on the supplied floor plan.
// Bookstore: Block B, Floor 2.
// Student HUB: Block C, Floor 2.
// The Block A-B bridge is separate from the Bookstore-to-HUB route.

export const PLACES = [
  { id: 'bookstore', name: 'Bookstore', block: 'B', floor: 2 },
  { id: 'student-hub', name: 'Student HUB', block: 'C', floor: 2 },
];

export const CORRIDORS = [
  { id: 'hub-a1', name: 'Block A, Floor 1 hallway', block: 'A', floor: 1 },
  { id: 'hub-a2', name: 'Block A, Floor 2 hallway', block: 'A', floor: 2 },
  { id: 'hub-b1', name: 'Block B, Floor 1 hallway', block: 'B', floor: 1 },
  { id: 'hub-b2', name: 'Block B, Floor 2 hallway', block: 'B', floor: 2 },
  { id: 'hub-c1', name: 'Block C, Floor 1 hallway', block: 'C', floor: 1 },
  { id: 'hub-c2', name: 'Block C, Floor 2 hallway', block: 'C', floor: 2 },
];

export const CONNECTIONS = [
  { id: 'a-elevator', from: 'hub-a1', to: 'hub-a2', kind: 'elevator', text: 'Take the Block A elevator to Floor 2.' },
  { id: 'a-stairs', from: 'hub-a1', to: 'hub-a2', kind: 'stairs', text: 'Take the Block A stairs to Floor 2.' },
  { id: 'b-elevator', from: 'hub-b1', to: 'hub-b2', kind: 'elevator', text: 'Take the Block B elevator to Floor 2.' },
  { id: 'b-stairs', from: 'hub-b1', to: 'hub-b2', kind: 'stairs', text: 'Take the Block B stairs to Floor 2.' },
  { id: 'c-elevator', from: 'hub-c1', to: 'hub-c2', kind: 'elevator', text: 'Take the Block C elevator to Floor 2.' },
  { id: 'c-stairs', from: 'hub-c1', to: 'hub-c2', kind: 'stairs', text: 'Take the Block C stairs to Floor 2.' },
  { id: 'bridge-ab', from: 'hub-a2', to: 'hub-b2', kind: 'bridge', text: 'Cross the bridge from Block A to Block B.' },
  { id: 'hall-bc', from: 'hub-b1', to: 'hub-c1', kind: 'hallway', text: 'Walk the hallway from Block B to Block C.' },
  {
    id: 'leave-bookstore',
    from: 'bookstore',
    to: 'hub-b2',
    kind: 'hallway',
    text: 'Leave the Bookstore and enter the Block B second-floor hallway.'
  },
  {
    id: 'hall-bc-2',
    from: 'hub-b2',
    to: 'hub-c2',
    kind: 'hallway',
    text: 'Continue through the second-floor corridor toward the Student HUB.'
  },
  {
    id: 'enter-hub',
    from: 'hub-c2',
    to: 'student-hub',
    kind: 'hallway',
    text: 'Arrive at the Student HUB.'
  },
];

export const BOOKSTORE_TO_HUB = [
  'leave-bookstore',
  'hall-bc-2',
  'enter-hub'
];

export function connectionText(connectionIds) {
  return connectionIds.map((id) => {
    const connection = CONNECTIONS.find((entry) => entry.id === id);
    if (!connection) {
      return { ok: false, error: 'That connection is not in the campus route data.' };
    }
    return connection.text;
  });
}
