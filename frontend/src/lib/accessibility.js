const FEATURES = [
  { id: 'elevator', label: 'Elevators' },
  { id: 'washroom', label: 'Accessible washrooms' },
  { id: 'ramp', label: 'Ramps' },
  { id: 'autoDoor', label: 'Auto doors' },
];

const PLACES = [
  {
    id: 'b-hub',
    name: 'Student HUB',
    elevator: true,
    washroom: true,
    ramp: true,
    autoDoor: false,
  },
  {
    id: 'b-b210',
    name: 'Room B210',
    elevator: true,
    washroom: false,
    ramp: false,
    autoDoor: false,
  },
];

export function listAccessibilityFeatures() {
  return FEATURES.map((feature) => feature.label);
}

export function getAccessibilityFeatures(placeId) {
  const place = PLACES.find((entry) => entry.id === placeId);
  if (!place) {
    return { ok: false, error: 'That place is not in the campus records.' };
  }

  const features = FEATURES.filter((feature) => place[feature.id]).map((feature) => feature.label);
  return { ok: true, id: place.id, name: place.name, features };
}
