// Route data for the Progress Campus pilot: Blocks A, B, and C.
// The Bookstore and the Student HUB are on the second floor.
// The bridge on that floor connects Block A and Block B.

export const PLACES = [
  { id: 'bookstore', name: 'Bookstore', block: 'A', floor: 2 },
  { id: 'student-hub', name: 'Student HUB', block: 'B', floor: 2 },
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
  { id: 'leave-bookstore', from: 'bookstore', to: 'hub-a2', kind: 'hallway', text: 'Leave the Bookstore along the Block A hallway.' },
  { id: 'enter-hub', from: 'hub-b2', to: 'student-hub', kind: 'hallway', text: 'Arrive at the Student HUB.' },
];

export const BOOKSTORE_TO_HUB = ['leave-bookstore', 'bridge-ab', 'enter-hub'];

export function connectionText(connectionIds) {
  return connectionIds.map((id) => {
    const connection = CONNECTIONS.find((entry) => entry.id === id);
    if (!connection) {
      return { ok: false, error: 'That connection is not in the campus route data.' };
    }
    return connection.text;
  });
}
