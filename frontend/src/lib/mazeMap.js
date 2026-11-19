const CAMPUS_ID = 2081;

function findMatchingRoom(results, roomCode) {
  const escaped = roomCode.trim().toUpperCase()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const pattern = new RegExp(
    `(?:^|[-/])${escaped}(?=$|/)`,
    'i'
  );

  return results.find(
    (item) =>
      item.campusId === CAMPUS_ID &&
      item.type === 'poi' &&
      typeof item.identifier === 'string' &&
      pattern.test(item.identifier)
  );
}

export async function getMazeMapDirections(startCode, endCode) {
  if (!window.Mazemap?.Search?.SearchController) {
    throw new Error('MazeMap is unavailable. Please reload the page.');
  }

  const search = new window.Mazemap.Search.SearchController({
    campusid: CAMPUS_ID,
    rows: 20,
    withpois: true
  });

  async function findRoom(code) {
    const response = await search.search(code);
    return findMatchingRoom(response.results || [], code);
  }

  const start = await findRoom(startCode);
  const destination = await findRoom(endCode);

  if (!start || !destination) {
    throw new Error('One or both rooms could not be found in MazeMap.');
  }

  const params = new URLSearchParams({
    v: '1',
    config: 'progresscampus',
    campusid: String(CAMPUS_ID),
    starttype: 'identifier',
    start: start.identifier,
    desttype: 'identifier',
    dest: destination.identifier
  });

  return `https://use.mazemap.com/#${params.toString()}`;
}
