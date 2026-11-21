import test from "node:test";
import assert from "node:assert/strict";
import { getPendingBarrierReports } from "../controllers/pendingBarrierReportController.js";
import BarrierReport from "../models/BarrierReport.js";

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

// Replaces BarrierReport.find with a chain that records the query and sort.
function mockFind(result, captured = {}) {
  BarrierReport.find = (query) => {
    captured.query = query;
    const chain = {
      select() {
        return chain;
      },
      sort(order) {
        captured.sort = order;
        return chain;
      },
      lean() {
        return result instanceof Error ? Promise.reject(result) : Promise.resolve(result);
      }
    };
    return chain;
  };
  return captured;
}

test("Story 24 returns every pending report with a count, oldest first", async () => {
  const originalFind = BarrierReport.find;
  const pending = [
    { _id: "older", type: "broken-elevator", location: "Near room B230, Block B", status: "Pending", createdAt: "2026-11-21T12:00:00.000Z" },
    { _id: "newer", type: "blocked-ramp", location: "A2-65A", status: "Pending", createdAt: "2026-11-21T13:00:00.000Z" }
  ];

  try {
    const captured = mockFind(pending);

    const res = mockResponse();
    await getPendingBarrierReports({}, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 2);
    assert.deepEqual(res.body.reports.map((report) => report._id), ["older", "newer"]);
    assert.deepEqual(captured.sort, { createdAt: 1 });
  } finally {
    BarrierReport.find = originalFind;
  }
});

test("Story 24 filters on status ignoring case and surrounding spaces", async () => {
  const originalFind = BarrierReport.find;

  try {
    const captured = mockFind([]);
    await getPendingBarrierReports({}, mockResponse());

    const pattern = captured.query.status;
    assert.equal(pattern instanceof RegExp, true);
    for (const value of ["Pending", "pending", "PENDING", "  Pending "]) {
      assert.equal(pattern.test(value), true, `${value} should match`);
    }
    for (const value of ["Approved", "Rejected", "Resolved", "Pending review", ""]) {
      assert.equal(pattern.test(value), false, `${value} should not match`);
    }
  } finally {
    BarrierReport.find = originalFind;
  }
});

test("Story 24 returns status in the schema form even if stored differently", async () => {
  const originalFind = BarrierReport.find;

  try {
    mockFind([{ _id: "legacy", location: "A Block", status: " pending " }]);

    const res = mockResponse();
    await getPendingBarrierReports({}, res);

    assert.equal(res.body.reports[0].status, "Pending");
  } finally {
    BarrierReport.find = originalFind;
  }
});

test("Story 24 returns an empty list with 200 when nothing is pending", async () => {
  const originalFind = BarrierReport.find;

  try {
    mockFind([]);

    const res = mockResponse();
    await getPendingBarrierReports({}, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 0);
    assert.deepEqual(res.body.reports, []);
  } finally {
    BarrierReport.find = originalFind;
  }
});

test("Story 24 returns a clean 500 when the database read fails", async () => {
  const originalFind = BarrierReport.find;
  const originalConsoleError = console.error;

  try {
    console.error = () => {};
    mockFind(new Error("connection lost"));

    const res = mockResponse();
    await getPendingBarrierReports({}, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unable to retrieve pending barrier reports");
    assert.equal(JSON.stringify(res.body).includes("connection lost"), false);
  } finally {
    BarrierReport.find = originalFind;
    console.error = originalConsoleError;
  }
});