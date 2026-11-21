import test from "node:test";
import assert from "node:assert/strict";
import { approveBarrierReport } from "../controllers/barrierReportController.js";
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

test("Story 25 changes a pending barrier report to Approved", async () => {
  const originalFind = BarrierReport.findById;
  const report = savedReport("Pending");

  try {
    BarrierReport.findById = async (id) => {
      assert.equal(id, REPORT_ID);
      return report;
    };

    const res = mockResponse();
    await approveBarrierReport({ params: { id: REPORT_ID } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Barrier report approved");
    assert.equal(report.status, "Approved");
    assert.equal(res.body.report.status, "Approved");
  } finally {
    BarrierReport.findById = originalFind;
  }
});

test("Story 25 does not approve a report that is not pending", async () => {
  const originalFind = BarrierReport.findById;

  try {
    for (const status of ["Rejected", "Resolved"]) {
      const report = savedReport(status);
      BarrierReport.findById = async () => report;

      const res = mockResponse();
      await approveBarrierReport({ params: { id: REPORT_ID } }, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, "Only pending reports can be approved.");
      assert.equal(report.status, status);
    }

    const approved = savedReport("Approved");
    BarrierReport.findById = async () => approved;
    const again = mockResponse();
    await approveBarrierReport({ params: { id: REPORT_ID } }, again);

    assert.equal(again.statusCode, 400);
    assert.equal(again.body.message, "This report is already approved.");
    assert.equal(approved.status, "Approved");
  } finally {
    BarrierReport.findById = originalFind;
  }
});

test("Story 25 says when the report is not in the collection", async () => {
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findById = async () => null;

    const res = mockResponse();
    await approveBarrierReport({ params: { id: "R-001" } }, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, "That report was not found.");
  } finally {
    BarrierReport.findById = originalFind;
  }
});
