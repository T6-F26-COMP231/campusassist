import test from "node:test";
import assert from "node:assert/strict";

import { getApprovedBarrierReports } from "../controllers/barrierReportController.js";
import { calculateRoute } from "../services/routeService.js";
import BarrierReport from "../models/BarrierReport.js";
import Location from "../models/Location.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

function query(result) {
  return {
    select() {
      return this;
    },
    sort() {
      return this;
    },
    lean: async () => result
  };
}

async function withReports(reports, runTest) {
  const originalFind = BarrierReport.find;
  const originalFindOne = Location.findOne;
  let queryFilter = null;

  BarrierReport.find = (filter) => {
    queryFilter = filter;
    const status = filter?.status;
    const matched = reports.filter((report) => report.status === status);
    return query(matched);
  };
  Location.findOne = () => ({
    lean: async () => null
  });

  try {
    await runTest(() => queryFilter);
  } finally {
    BarrierReport.find = originalFind;
    Location.findOne = originalFindOne;
  }
}

test("Story 25 returns approved barrier locations and leaves other statuses out", async () => {
  await withReports(
    [
      { location: "Bookstore (B2-02)", status: "Approved" },
      { location: "Student Hub", status: "Pending" },
      { location: "A3-74", status: "Rejected" },
      { location: "A1-51", status: "Resolved" }
    ],
    async (filter) => {
      const res = mockResponse();
      await getApprovedBarrierReports({}, res);

      assert.deepEqual(filter(), { status: "Approved" });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 1);
      assert.deepEqual(res.body.reports, [
        { location: "Bookstore (B2-02)", status: "Approved" }
      ]);
    }
  );
});

test("Story 25 walks around an approved barrier and ignores a pending one", async () => {
  const bookstore = "1002074368";
  const hub = "1002096928";

  await withReports(
    [{ location: "Student Hub", status: "Pending" }],
    async () => {
      const open = await calculateRoute(bookstore, hub);
      assert.equal(open.ok, true);
      assert.equal(open.route.steps.at(-1).instruction, "Arrive at Student Hub");
    }
  );

  await withReports(
    [{ location: "Student Hub", status: "Approved" }],
    async (filter) => {
      const blocked = await calculateRoute(bookstore, hub);
      assert.deepEqual(filter(), { status: "Approved" });
      assert.equal(blocked.ok, false);
      assert.equal(blocked.status, 409);
      assert.equal(blocked.error, "An approved barrier blocks Student Hub");
    }
  );
});

test("Story 25 leaves the route unchanged when an approved location is not a map place", async () => {
  const bookstore = "1002074368";
  const hub = "1002096928";

  await withReports([{ location: "somewhere in the hallway", status: "Approved" }], async () => {
    const route = await calculateRoute(bookstore, hub);
    assert.equal(route.ok, true);
    assert.equal(route.route.steps.at(-1).instruction, "Arrive at Student Hub");
  });
});
