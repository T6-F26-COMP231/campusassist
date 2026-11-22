import test from "node:test";
import assert from "node:assert/strict";
import { resolveBarrierReport } from "../controllers/barrierReportController.js";
import { getApprovedBarrierReportsForAdmin } from "../controllers/approvedBarrierReportAdminController.js";
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

test("Story 27 resolves an approved barrier stored with different case or spaces", async () => {
  const originalFind = BarrierReport.findById;

  try {
    for (const stored of ["approved", " APPROVED ", "Approved "]) {
      const report = savedReport(stored);
      BarrierReport.findById = async () => report;

      const res = mockResponse();
      await resolveBarrierReport({ params: { id: REPORT_ID } }, res);

      assert.equal(res.statusCode, 200, stored);
      assert.equal(report.status, "Resolved", stored);
    }
  } finally {
    BarrierReport.findById = originalFind;
  }
});

test("Story 27 treats ' resolved ' as already resolved and 'PENDING' as not approved", async () => {
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findById = async () => savedReport(" resolved ");
    const done = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, done);
    assert.equal(done.statusCode, 400);
    assert.equal(done.body.message, "This barrier is already resolved.");

    const waiting = savedReport("PENDING");
    BarrierReport.findById = async () => waiting;
    const res = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Only approved barriers can be marked resolved.");
    assert.equal(waiting.status, "PENDING");
  } finally {
    BarrierReport.findById = originalFind;
  }
});

test("Story 27 lists approved barriers with ids for the Administrator", async () => {
  const originalFind = BarrierReport.find;
  let query;

  try {
    BarrierReport.find = (filter) => {
      query = filter;
      return {
        select() { return this; },
        sort() { return this; },
        async lean() {
          return [{ _id: REPORT_ID, type: "broken-elevator", location: "B230", status: " approved " }];
        }
      };
    };

    const res = mockResponse();
    await getApprovedBarrierReportsForAdmin({}, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.reports[0]._id, REPORT_ID);
    assert.equal(res.body.reports[0].status, "Approved");
    assert.ok(query.status.test("  Approved "));
    assert.ok(!query.status.test("Resolved"));
    assert.ok(!query.status.test("Pending"));
  } finally {
    BarrierReport.find = originalFind;
  }
});

test("Story 27 admin approved list answers 500 when the database fails", async () => {
  const originalFind = BarrierReport.find;

  try {
    BarrierReport.find = () => { throw new Error("db down"); };

    const res = mockResponse();
    await getApprovedBarrierReportsForAdmin({}, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
  } finally {
    BarrierReport.find = originalFind;
  }
});