import assert from 'node:assert/strict';
import test from 'node:test';
import { approvedBarrierLocations, BARRIERS_UNAVAILABLE_MESSAGE } from './approvedBarriers.js';

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  json: async () => body,
});

test('approved barrier locations are read from the approved route', async () => {
  let called = '';
  const locations = await approvedBarrierLocations(async (url) => {
    called = url;
    return jsonResponse(200, {
      success: true,
      reports: [
        { location: 'Bookstore (B2-02)', status: 'Approved' },
        { location: '   ', status: 'Approved' },
      ],
    });
  });

  assert.equal(called, '/api/barrier-reports/approved');
  assert.deepEqual(locations, ['Bookstore (B2-02)']);
});

test('a failed approved-barrier request is reported on its own', async () => {
  await assert.rejects(
    () => approvedBarrierLocations(async () => jsonResponse(500, { success: false })),
    { message: BARRIERS_UNAVAILABLE_MESSAGE },
  );
});
