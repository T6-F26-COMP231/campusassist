import assert from 'node:assert/strict';
import test from 'node:test';
import { searchLocations } from './locations.js';

test('searching Bookstore shows the Bookstore', () => {
  const result = searchLocations('Bookstore');

  assert.equal(result.ok, true);
  assert.ok(result.results.some((place) => place.name === 'Bookstore'));
});

test('the search matches the name in any letter case', () => {
  const result = searchLocations('bookstore');

  assert.equal(result.ok, true);
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].name, 'Bookstore');
});

test('an unknown name has no results', () => {
  const result = searchLocations('Not A Real Place');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'No results were found.');
  assert.deepEqual(result.results, []);
});

test('a blank search asks for a location name', () => {
  const result = searchLocations('   ');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'Enter a location name to search.');
});
