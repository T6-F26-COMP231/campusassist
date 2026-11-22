
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
    location: "Near room B230, Block B"
  };
}

test("Story 27 resolves an approved barrier stored with different case or spaces", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const originalFind = BarrierReport.findById;

  try {
    for (const stored of ["approved", " APPROVED ", "Approved "]) {
      let updated = false;

      BarrierReport.findOneAndUpdate = async (filter, update, options) => {
        assert.equal(filter._id, REPORT_ID);
        assert.ok(filter.status instanceof RegExp);
        assert.equal(filter.status.test(stored), true);
        assert.deepEqual(update, { $set: { status: "Resolved" } });
        assert.equal(options.runValidators, true);

        updated = true;
        return savedReport("Resolved");
      };

      BarrierReport.findById = async () => {
        throw new Error("findById should not run after successful update");
      };

      const res = mockResponse();
      await resolveBarrierReport({ params: { id: REPORT_ID } }, res);

      assert.equal(res.statusCode, 200, stored);
      assert.equal(res.body.success, true);
      assert.equal(res.body.report.status, "Resolved");
      assert.equal(updated, true);
    }
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
    BarrierReport.findById = originalFind;
  }
});

test("Story 27 treats ' resolved ' as already resolved and 'PENDING' as not approved", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findOneAndUpdate = async () => null;

    BarrierReport.findById = async () => savedReport(" resolved ");
    const done = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, done);

    assert.equal(done.statusCode, 400);
    assert.equal(done.body.message, "This barrier is already resolved.");

    BarrierReport.findById = async () => savedReport("PENDING");
    const waiting = mockResponse();
    await resolveBarrierReport({ params: { id: REPORT_ID } }, waiting);

    assert.equal(waiting.statusCode, 400);
    assert.equal(
      waiting.body.message,
      "Only approved barriers can be marked resolved."
    );
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
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
          return [
            {
              _id: REPORT_ID,
              type: "broken-elevator",
              location: "B230",
              status: " approved "
            }
          ];
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
    BarrierReport.find = () => {
      throw new Error("db down");
    };

    const res = mockResponse();
    await getApprovedBarrierReportsForAdmin({}, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
  } finally {
    BarrierReport.find = originalFind;
  }
});
