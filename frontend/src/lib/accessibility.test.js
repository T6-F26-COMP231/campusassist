import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAccessibilityFeatures,
  getLocationAccessibility,
  getAccessibilityReport,
  listAccessibilityFeatures,
  listPlaces
} from './accessibility.js';


test('the accessible facilities are elevators, washrooms, ramps, and auto doors', () => {
  assert.deepEqual(listAccessibilityFeatures(), [
    'Elevators',
    'Accessible washrooms',
    'Ramps',
    'Auto doors',
  ]);
});

test('Student HUB includes an elevator', () => {
  const result = getAccessibilityFeatures('b-hub');

  assert.equal(result.ok, true);
  assert.equal(result.name, 'Student HUB');
  assert.ok(result.features.includes('Elevators'));
});

test('Room B210 has no accessible washroom', () => {
  const result = getAccessibilityFeatures('b-b210');

  assert.equal(result.ok, true);
  assert.equal(result.features.includes('Accessible washrooms'), false);
});

test('a destination with an elevator lists the elevator', () => {
  const result = getLocationAccessibility('b-hub');
  const elevator = result.details.find((detail) => detail.feature === 'Elevators');

  assert.equal(result.ok, true);
  assert.equal(elevator.available, true);
  assert.equal(elevator.text, 'Elevator');
});

test('a destination without an accessible washroom says so', () => {
  const result = getLocationAccessibility('b-b210');
  const washroom = result.details.find((detail) => detail.feature === 'Accessible washrooms');

  assert.equal(result.ok, true);
  assert.equal(washroom.available, false);
  assert.equal(washroom.text, 'No accessible washroom');
});

test('an unknown place is not found', () => {
  const result = getAccessibilityFeatures('missing');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'That place is not in the campus records.');
});

test('the report lists every feature, with a yes or no for each', () => {
  const report = getAccessibilityReport('b-b210');
  assert.equal(report.ok, true);
  assert.equal(report.items.length, 4);
  assert.equal(report.items.find((i) => i.id === 'elevator').available, true);
  assert.equal(report.items.find((i) => i.id === 'washroom').available, false);
  assert.equal(report.availableCount, 1);
  assert.equal(report.total, 4);
});

test('only the two campus place records are listed', () => {
  assert.deepEqual(listPlaces().map((place) => place.name), ['Student HUB', 'Room B210']);
});

test('every listed place has a report', () => {
  for (const place of listPlaces()) {
    assert.equal(getAccessibilityReport(place.id).ok, true, place.id);
  }
  assert.equal(getAccessibilityReport('missing').ok, false);
});

test('the report names the features a destination is missing', () => {
  assert.deepEqual(getAccessibilityReport('b-b210').missing, [
    'Accessible washrooms',
    'Ramps',
    'Auto doors'
  ]);
  assert.deepEqual(getAccessibilityReport('b-hub').missing, ['Auto doors']);
});

test('missing and available features together cover every feature', () => {
  for (const place of listPlaces()) {
    const report = getAccessibilityReport(place.id);
    assert.equal(report.missing.length + report.availableCount, report.total, place.id);
  }
});