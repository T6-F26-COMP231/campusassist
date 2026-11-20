import { FACILITIES } from './facilitiesData.js';

// Kinds of facilities a Campus User can filter by. `mark` is the letter drawn on the map.
export const FACILITY_TYPES = [
  { id: 'elevator', label: 'Elevators', mark: 'E' },
  { id: 'accessible-washroom', label: 'Accessible washrooms', mark: 'WC' },
  { id: 'food-and-drink', label: 'Food and drink', mark: 'F' },
  { id: 'water-station', label: 'Water stations', mark: 'H2O' },
  { id: 'aed', label: 'AEDs (defibrillators)', mark: 'AED' },
  { id: 'information', label: 'Information desks', mark: 'i' },
  { id: 'multi-faith-room', label: 'Multi-faith rooms', mark: 'MF' },
  { id: 'parenting-room', label: 'Parenting room', mark: 'P' },
];

// Facilities from the Progress Campus floor plan (see facilitiesData.js).
export { FACILITIES };

// Buildings that have at least one facility, in campus order, with a label for the picker.
const BUILDINGS = [
  { id: 'A', label: 'A Block' },
  { id: 'BCDE', label: 'B, C, D & E Blocks' },
  { id: 'L', label: 'L Block (Ann Buller Learning Centre)' },
  { id: 'R', label: 'R Block (Centennial Place)' },
  { id: 'SCAWC', label: 'Student Centre & AWC' },
];

export function facilityBuildings(facilities = FACILITIES) {
  const present = new Set(facilities.map((facility) => facility.building));
  return BUILDINGS.filter(({ id }) => present.has(id));
}

// No type selected shows every type. With several selected, a facility is shown when it
// matches any of them. `building` ('' = all of campus) narrows the result further.
// The input list is not changed.
export function filterFacilities(facilities, selectedTypes = [], building = '') {
  return facilities.filter(
    (facility) =>
      (selectedTypes.length === 0 || selectedTypes.includes(facility.type)) &&
      (building === '' || facility.building === building),
  );
}
