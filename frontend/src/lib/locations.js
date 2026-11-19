// Named places printed on the Progress Campus floor plan.
// The full campus locations table is a separate task.
export const LOCATIONS = [
  { id: 'bookstore', name: 'Bookstore', where: 'Second floor' },
  { id: 'student-hub', name: 'Student HUB', where: 'Second floor' },
  { id: 'student-centre', name: 'Student Centre', where: 'Progress Campus' },
  { id: 'transit-hub', name: 'Transit Hub', where: 'Progress Campus' },
];

export function searchLocations(query, locations = LOCATIONS) {
  const name = typeof query === 'string' ? query.trim() : '';

  if (!name) {
    return { ok: false, error: 'Enter a location name to search.' };
  }

  const needle = name.toLowerCase();
  const results = locations.filter((place) => place.name.toLowerCase().includes(needle));

  if (results.length === 0) {
    return { ok: false, error: 'No results were found.', results: [] };
  }

  return { ok: true, query: name, results };
}
