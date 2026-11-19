const FEATURES = [
  { id: 'elevator', label: 'Elevators' },
  { id: 'washroom', label: 'Accessible washrooms' },
  { id: 'ramp', label: 'Ramps' },
  { id: 'autoDoor', label: 'Auto doors' },
];

// `notes` says where the feature is, shown only when the feature is there.
const PLACES = [
  {
    id: 'b-hub',
    name: 'Student HUB',
    where: 'B Block, Floor 1',
    elevator: true,
    washroom: true,
    ramp: true,
    autoDoor: false,
    notes: {
      elevator: 'Elevator next to the main B Block lobby.',
      washroom: 'Accessible washroom on the same floor.',
      ramp: 'Ramp at the main entrance.',
    },
  },
  {
    id: 'b-b210',
    name: 'Room B210',
    where: 'B Block, Floor 2',
    elevator: true,
    washroom: false,
    ramp: false,
    autoDoor: false,
    notes: { elevator: 'Take the B Block elevator to Floor 2.' },
  },
  {
    id: 'a-library',
    name: 'Library (A Block)',
    where: 'A Block, Floor 2',
    elevator: true,
    washroom: true,
    ramp: true,
    autoDoor: true,
    notes: {
      elevator: 'Elevators near the A Block atrium.',
      washroom: 'Accessible washroom on Floor 2.',
      ramp: 'Step-free entrance from the main walkway.',
      autoDoor: 'Automatic doors at the main entrance.',
    },
  },
  {
    id: 'l-alc',
    name: 'Ann Buller Learning Centre (L Block)',
    where: 'L Block, Floor 1',
    elevator: true,
    washroom: true,
    ramp: false,
    autoDoor: true,
    notes: {
      elevator: 'Elevator inside the main entrance.',
      washroom: 'Accessible washroom on Floor 1.',
      autoDoor: 'Automatic doors at the main entrance.',
    },
  },
  {
    id: 'sc-awc',
    name: 'Student Centre & Athletics and Wellness Centre',
    where: 'Student Centre, Floor 1',
    elevator: true,
    washroom: true,
    ramp: true,
    autoDoor: true,
    notes: {
      elevator: 'Elevators beside the front desk.',
      washroom: 'Accessible washrooms on every floor.',
      ramp: 'Ramp from the parking area.',
      autoDoor: 'Automatic doors at both entrances.',
    },
  },
  {
    id: 'r-centennial',
    name: 'Centennial Place (R Block)',
    where: 'R Block, Floor 1',
    elevator: true,
    washroom: false,
    ramp: true,
    autoDoor: false,
    notes: {
      elevator: 'Elevator in the main lobby.',
      ramp: 'Ramp at the front entrance.',
    },
  },
];

export function listAccessibilityFeatures() {
  return FEATURES.map((feature) => feature.label);
}

export function listPlaces() {
  return PLACES.map(({ id, name, where }) => ({ id, name, where }));
}

export function getAccessibilityFeatures(placeId) {
  const place = PLACES.find((entry) => entry.id === placeId);

  if (!place) {
    return { ok: false, error: 'That place is not in the campus records.' };
  }

  const features = FEATURES.filter((feature) => place[feature.id]).map((feature) => feature.label);
  return { ok: true, id: place.id, name: place.name, features };
}

// Every feature with a yes/no and a note, so the screen can show what is missing too.
export function getAccessibilityReport(placeId) {
  const place = PLACES.find((entry) => entry.id === placeId);

  if (!place) {
    return { ok: false, error: 'That place is not in the campus records.' };
  }

  const items = FEATURES.map((feature) => ({
    id: feature.id,
    label: feature.label,
    available: Boolean(place[feature.id]),
    note: place[feature.id] ? place.notes?.[feature.id] ?? '' : '',
  }));
  return {
    ok: true,
    id: place.id,
    name: place.name,
    where: place.where,
    items,
    availableCount: items.filter((item) => item.available).length,
    total: items.length,
  };
}
