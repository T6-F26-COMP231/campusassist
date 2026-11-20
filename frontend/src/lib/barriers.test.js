import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BARRIER_TYPES,
  DESCRIPTION_LIMIT,
  MISSING_LOCATION_MESSAGE,
  MISSING_TYPE_MESSAGE,
  PHOTO_NOT_IMAGE_MESSAGE,
  PHOTO_TOO_BIG_MESSAGE,
  buildBarrierReport,
  reportNumber,
  validateBarrierReport,
  validatePhoto,
} from './barriers.js';

test('the form offers the six barrier types, starting with a broken elevator', () => {
  assert.deepEqual(BARRIER_TYPES.map((type) => type.label), [
    'Broken Elevator',
    'Blocked Entrance',
    'Construction Closure',
    'Broken Door',
    'Blocked Ramp',
    'Other',
  ]);
});

test('a report with a type and a location is valid', () => {
  const result = validateBarrierReport({ type: 'broken-elevator', location: 'Near room B230, Block B' });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, {});
});

test('a report without a location is not accepted', () => {
  for (const location of ['', '   ', undefined]) {
    const result = validateBarrierReport({ type: 'broken-elevator', location });

    assert.equal(result.ok, false);
    assert.equal(result.errors.location, MISSING_LOCATION_MESSAGE);
  }
});

test('a report without a barrier type is not accepted', () => {
  const result = validateBarrierReport({ type: '', location: 'A Block' });

  assert.equal(result.ok, false);
  assert.equal(result.errors.type, MISSING_TYPE_MESSAGE);
  assert.equal(validateBarrierReport({ type: 'not-a-type', location: 'A Block' }).ok, false);
});

test('a description over the limit is not accepted', () => {
  const long = 'x'.repeat(DESCRIPTION_LIMIT + 1);

  assert.equal(validateBarrierReport({ type: 'other', location: 'A Block', description: long }).ok, false);
  assert.equal(validateBarrierReport({ type: 'other', location: 'A Block', description: 'x'.repeat(DESCRIPTION_LIMIT) }).ok, true);
});

test('the photo is optional, and must be a small image', () => {
  assert.equal(validatePhoto(null).ok, true);
  assert.equal(validatePhoto({ type: 'image/png', size: 1000 }).ok, true);
  assert.equal(validatePhoto({ type: 'application/pdf', size: 1000 }).error, PHOTO_NOT_IMAGE_MESSAGE);
  assert.equal(validatePhoto({ type: 'image/jpeg', size: 6 * 1024 * 1024 }).error, PHOTO_TOO_BIG_MESSAGE);
});

test('report numbers go up for each new report', () => {
  assert.equal(reportNumber(0), 'R-001');
  assert.equal(reportNumber(2), 'R-003');
  assert.equal(reportNumber(99), 'R-100');
});

test('a valid report is built with its number, type name and trimmed text', () => {
  const result = buildBarrierReport(
    { type: 'broken-elevator', location: '  Near room B230, Block B ', description: ' Out of service ' },
    2,
    'elevator.jpg',
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.report, {
    id: 'R-003',
    type: 'broken-elevator',
    typeLabel: 'Broken Elevator',
    location: 'Near room B230, Block B',
    description: 'Out of service',
    photoName: 'elevator.jpg',
  });
});

test('an invalid report is not built', () => {
  const result = buildBarrierReport({ type: 'broken-elevator', location: '' });

  assert.equal(result.ok, false);
  assert.equal(result.report, undefined);
  assert.equal(result.errors.location, MISSING_LOCATION_MESSAGE);
});
