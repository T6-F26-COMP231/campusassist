import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BARRIER_TYPES,
  DESCRIPTION_LIMIT,
  LOCATION_LIMIT,
  LOCATION_TOO_LONG_MESSAGE,
  MISSING_CLASSROOM_MESSAGE,
  MISSING_LOCATION_MESSAGE,
  MISSING_ROLE_MESSAGE,
  REPORTER_ROLES,
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
    status: 'Pending',
    role: 'campus-user',
    roleLabel: 'Campus User',
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

test('a report can be made by a Campus User or by Faculty Staff', () => {
  assert.deepEqual(REPORTER_ROLES.map((role) => role.label), ['Campus User', 'Faculty Staff']);
});

test('a Faculty Staff report without a classroom is not accepted, and says classroom', () => {
  for (const location of ['', '   ', undefined]) {
    const result = validateBarrierReport({ role: 'faculty-staff', type: 'broken-elevator', location });

    assert.equal(result.ok, false);
    assert.equal(result.errors.location, MISSING_CLASSROOM_MESSAGE);
  }
  assert.match(MISSING_CLASSROOM_MESSAGE, /classroom/);
});

test('a Campus User report without a location keeps the location message', () => {
  const result = validateBarrierReport({ role: 'campus-user', type: 'broken-elevator', location: '' });

  assert.equal(result.errors.location, MISSING_LOCATION_MESSAGE);
});

test('a Faculty Staff report with a classroom is valid and keeps who reported it', () => {
  const result = buildBarrierReport(
    { role: 'faculty-staff', type: 'blocked-entrance', location: '  B230, outside the door ' },
    0,
  );

  assert.equal(result.ok, true);
  assert.equal(result.report.role, 'faculty-staff');
  assert.equal(result.report.roleLabel, 'Faculty Staff');
  assert.equal(result.report.location, 'B230, outside the door');
});

test('an unknown reporter is not accepted', () => {
  const result = validateBarrierReport({ role: 'visitor', type: 'other', location: 'A Block' });

  assert.equal(result.ok, false);
  assert.equal(result.errors.role, MISSING_ROLE_MESSAGE);
});

test('a location over the limit is not accepted', () => {
  const long = 'x'.repeat(LOCATION_LIMIT + 1);

  assert.equal(validateBarrierReport({ role: 'faculty-staff', type: 'other', location: long }).errors.location, LOCATION_TOO_LONG_MESSAGE);
  assert.equal(validateBarrierReport({ type: 'other', location: 'x'.repeat(LOCATION_LIMIT) }).ok, true);
});

test('every missing field is reported at once', () => {
  const result = validateBarrierReport({ role: 'faculty-staff', type: '', location: '' });

  assert.deepEqual(Object.keys(result.errors).sort(), ['location', 'type']);
});
