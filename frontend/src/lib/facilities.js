import { FACILITIES } from './facilitiesData.js';

// Types of accessible facilities a Campus User can filter by.
export const FACILITY_TYPES = [
  { id: 'elevator', label: 'Elevators' },
  { id: 'accessible-washroom', label: 'Accessible washrooms' },
];

// Real facilities read from the Progress Campus floor plan (see facilitiesData.js).
export { FACILITIES };

// Blocks that have at least one facility, in campus order, with a label for the picker.
const BLOCK_ORDER = ['A', 'B', 'C', 'D', 'E', 'L', 'P', 'R', 'G', 'SC', 'AWC'];
const BLOCK_LABELS = { SC: 'Student Centre', AWC: 'Athletic & Wellness Centre' };

export function facilityBlocks(facilities = FACILITIES) {
  const present = new Set(facilities.map((facility) => facility.block));
  return BLOCK_ORDER.filter((id) => present.has(id)).map((id) => ({
    id,
    label: BLOCK_LABELS[id] ?? `${id} Block`,
  }));
}

// No type selected shows every type. With several selected, a facility is shown when it
// matches any of them. `block` ('' = all blocks) narrows the result further.
// The input list is not changed.
export function filterFacilities(facilities, selectedTypes = [], block = '') {
  return facilities.filter(
    (facility) =>
      (selectedTypes.length === 0 || selectedTypes.includes(facility.type)) &&
      (block === '' || facility.block === block),
  );
}
