import assert from 'node:assert/strict';
import test from 'node:test';
import { HOME_ACTIONS, HOME_ITEMS, HOME_SECTIONS } from './homeSections.js';

test('Home is one starting point for every feature, with the button names the guide uses', () => {
  assert.deepEqual(HOME_ITEMS.map((item) => item.label), [
    'Request In-Person Help',
    'My Help Request Status',
    'Get Step-by-Step Directions',
    'Search Location',
    'Find Accessible Facilities',
    'Check Destination Accessibility',
    'Report Barrier',
    'View Open Requests (Volunteer)',
    'Administrator',
  ]);
});

test('every button opens its own screen, and no two buttons share a name', () => {
  assert.equal(new Set(HOME_ACTIONS).size, HOME_ACTIONS.length);
  assert.equal(new Set(HOME_ITEMS.map((item) => item.label)).size, HOME_ITEMS.length);
  assert.deepEqual([...HOME_ACTIONS].sort(), [
    'admin', 'facilities', 'features', 'getDirections', 'openRequests',
    'reportBarrier', 'requestHelp', 'requestStatus', 'searchLocation',
  ]);
});

test('every button has a hint, and every group has a title and at least one button', () => {
  for (const item of HOME_ITEMS) {
    assert.ok(item.label.trim() && item.hint.trim(), item.action);
  }
  for (const section of HOME_SECTIONS) {
    assert.ok(section.title.trim() && section.items.length > 0, section.id);
  }
  assert.equal(new Set(HOME_SECTIONS.map((section) => section.id)).size, HOME_SECTIONS.length);
});

test('getting help comes first, and Request In-Person Help is the main button', () => {
  assert.equal(HOME_SECTIONS[0].id, 'help');
  assert.deepEqual(HOME_ITEMS.filter((item) => item.primary).map((item) => item.label), ['Request In-Person Help']);
});
