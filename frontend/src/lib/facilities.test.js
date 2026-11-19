import assert from 'node:assert/strict';
import test from 'node:test';
import { FACILITIES, FACILITY_TYPES, facilityBlocks, filterFacilities } from './facilities.js';

const ids = (list) => list.map((facility) => facility.id);

test('no filter selected shows every facility', () => {
  assert.deepEqual(ids(filterFacilities(FACILITIES, [])), ids(FACILITIES));
  assert.deepEqual(ids(filterFacilities(FACILITIES)), ids(FACILITIES));
});

test('one filter shows only that type', () => {
  const result = filterFacilities(FACILITIES, ['elevator']);
  assert.ok(result.length > 0);
  assert.ok(result.every((facility) => facility.type === 'elevator'));
});

test('several filters show facilities matching any of them', () => {
  const types = ['elevator', 'accessible-washroom'];
  const result = filterFacilities(FACILITIES, types);
  assert.ok(result.every((facility) => types.includes(facility.type)));
  assert.equal(
    result.length,
    filterFacilities(FACILITIES, ['elevator']).length +
      filterFacilities(FACILITIES, ['accessible-washroom']).length,
  );
});

test('a block narrows the result, together with the type filter', () => {
  const inA = filterFacilities(FACILITIES, [], 'A');
  assert.ok(inA.length > 0 && inA.every((facility) => facility.block === 'A'));
  const elevatorsInA = filterFacilities(FACILITIES, ['elevator'], 'A');
  assert.ok(elevatorsInA.every((f) => f.block === 'A' && f.type === 'elevator'));
  assert.ok(elevatorsInA.length < inA.length);
});

test('a type with no facilities gives an empty list, and the input is untouched', () => {
  const copy = [...FACILITIES];
  assert.deepEqual(filterFacilities(FACILITIES, ['parking']), []);
  assert.deepEqual(FACILITIES, copy);
});

test('every filter option and every listed block has facilities', () => {
  for (const { id } of FACILITY_TYPES) {
    assert.ok(filterFacilities(FACILITIES, [id]).length > 0, id);
  }
  for (const { id } of facilityBlocks()) {
    assert.ok(filterFacilities(FACILITIES, [], id).length > 0, id);
  }
});

test('every facility has a real location on a floor plan page', () => {
  for (const facility of FACILITIES) {
    assert.ok(facility.location && facility.details, facility.id);
    assert.ok([1, 2, 3, 4, 5].includes(facility.plan.page), facility.id);
    assert.ok(facility.plan.x > 0 && facility.plan.x < 100, facility.id);
    assert.ok(facility.plan.y > 0 && facility.plan.y < 100, facility.id);
  }
  assert.equal(new Set(ids(FACILITIES)).size, FACILITIES.length);
});
