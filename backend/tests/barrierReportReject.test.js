import test from "node:test";
import assert from "node:assert/strict";
import { rejectBarrierReport } from "../controllers/barrierReportController.js";
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

test("Story 26 changes a pending barrier report to Rejected", async () => {
  const originalFind = BarrierReport.findById;
  const report = savedReport("Pending");

  try {
    BarrierReport.findById = async (id) => {
      assert.equal(id, REPORT_ID);
      return report;
    };

    const res = mockResponse();
    await rejectBarrierReport({ params: { id: REPORT_ID } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Barrier report rejected");
    assert.equal(report.status, "Rejected");
    assert.equal(res.body.report.status, "Rejected");
  } finally {
    BarrierReport.findById = originalFind;
  }
});

test("Story 26 does not reject a report that is not pending", async () => {
  const originalFind = BarrierReport.findById;

  try {
    for (const status of ["Approved", "Resolved"]) {
      const report = savedReport(status);
      BarrierReport.findById = async () => report;

      const res = mockResponse();
      await rejectBarrierReport({ params: { id: REPORT_ID } }, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, "Only pending reports can be rejected.");
      assert.equal(report.status, status);
    }

    const rejected = savedReport("Rejected");
    BarrierReport.findById = async () => rejected;
    const again = mockResponse();
    await rejectBarrierReport({ params: { id: REPORT_ID } }, again);

    assert.equal(again.statusCode, 400);
    assert.equal(again.body.message, "This report is already rejected.");
    assert.equal(rejected.status, "Rejected");
  } finally {
    BarrierReport.findById = originalFind;
  }
});

test("Story 26 says when the report is not in the collection", async () => {
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findById = async () => null;

    const res = mockResponse();
    await rejectBarrierReport({ params: { id: "R-001" } }, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, "That report was not found.");
  } finally {
    BarrierReport.findById = originalFind;
  }
});
