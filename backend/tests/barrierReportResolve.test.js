import test from "node:test";
import assert from "node:assert/strict";
import { resolveBarrierReport } from "../controllers/barrierReportController.js";
import BarrierReport from "../models/BarrierReport.js";

const REPORT_ID = "507f1f77bcf86cd799439011";

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

function savedReport(status) {
  return {
    _id: REPORT_ID,
    status,
    location: "Near room B230, Block B",
    async save() {
      return this;
    }
  };
}

test("Story 27 marks an approved barrier resolved", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const report = savedReport("Resolved");

  try {
    BarrierReport.findOneAndUpdate = async (filter, update, options) => {
      const query = filter;
      assert.equal(query._id, REPORT_ID);
      assert.ok(query.status instanceof RegExp);
      assert.equal(query.status.test("Approved"), true);
      assert.equal(query.status.test(" approved "), true);
      assert.equal(query.status.test("APPROVED"), true);
      assert.equal(query.status.test("Pending"), false);
      assert.deepEqual(update, { $set: { status: "Resolved" } });
      assert.equal(options.new, true);
      assert.equal(options.runValidators, true);
      return report;
    };

    const res = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Barrier report marked resolved");
    assert.equal(report.status, "Resolved");
    assert.equal(res.body.report.status, "Resolved");
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
  }
});

test("Story 27 does not resolve a barrier that was never approved", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const originalFind = BarrierReport.findById;

  try {
    for (const status of ["Pending", "Rejected"]) {
      const report = savedReport(status);
      BarrierReport.findOneAndUpdate = async () => null;
      BarrierReport.findById = async () => report;

      const res = mockResponse();
      await resolveBarrierReport({ params: { id: REPORT_ID } }, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Only approved barriers can be marked resolved.");
      assert.equal(report.status, status);
    }
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
    BarrierReport.findById = originalFind;
  }
});

test("Story 27 does not resolve a barrier that is already resolved", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findOneAndUpdate = async () => null;
    BarrierReport.findById = async () => savedReport("Resolved");

    const res = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "This barrier is already resolved.");
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
    BarrierReport.findById = originalFind;
  }
});

test("Story 27 says when the report is not in the collection", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findOneAndUpdate = async () => null;
    BarrierReport.findById = async () => null;

    const res = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, "That report was not found.");

    const badId = mockResponse();
    await resolveBarrierReport({ params: { id: "R-001" } }, badId);

    assert.equal(badId.statusCode, 404);
    assert.equal(badId.body.message, "That report was not found.");
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
    BarrierReport.findById = originalFind;
  }
});
