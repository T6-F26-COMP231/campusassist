import test from "node:test";
import assert from "node:assert/strict";
import BarrierReport from "../models/BarrierReport.js";
import { reviewReport } from "../services/barrierReportReviewService.js";
import {
  approveBarrierReport,
  rejectBarrierReport
} from "../controllers/barrierReportReviewController.js";

const ID = "507f1f77bcf86cd799439011";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; }
  };
}

const chain = (result) => {
  const c = { select: () => c, lean: () => Promise.resolve(result) };
  return c;
};

test("Issue 82 approving and rejecting save Approved and Rejected, whatever the casing sent", async () => {
  const original = BarrierReport.findOneAndUpdate;
  const calls = [];

  try {
    BarrierReport.findOneAndUpdate = (filter, update) => {
      calls.push({ filter, update });
      return chain({ _id: ID, status: update.$set.status });
    };

    const approved = await reviewReport(ID, " Approved ");
    const rejected = await reviewReport(ID, "REJECTED");

    assert.equal(approved.report.status, "Approved");
    assert.equal(rejected.report.status, "Rejected");
    // Only a report whose status is Pending, in any casing, can be changed.
    assert.equal(calls[0].filter._id, ID);
    assert.equal(calls[0].filter.status.$regex.test(" pending "), true);
    assert.equal(calls[0].filter.status.$regex.test("Approved"), false);
  } finally {
    BarrierReport.findOneAndUpdate = original;
  }
});

test("Issue 82 a report that is not pending, missing, or sent a bad status is refused", async () => {
  const originalUpdate = BarrierReport.findOneAndUpdate;
  const originalFind = BarrierReport.findById;

  try {
    BarrierReport.findOneAndUpdate = () => chain(null);

    BarrierReport.findById = () => chain({ _id: ID, status: "Approved" });
    const notPending = await reviewReport(ID, "rejected");
    assert.equal(notPending.code, 400);
    assert.equal(notPending.message, "Only pending reports can be approved or rejected.");

    BarrierReport.findById = () => chain(null);
    assert.equal((await reviewReport(ID, "approved")).code, 404);

    assert.equal((await reviewReport("not-an-id", "approved")).code, 404);
    assert.equal((await reviewReport(ID, "resolved")).code, 400);
    assert.equal((await reviewReport(ID, undefined)).code, 400);
  } finally {
    BarrierReport.findOneAndUpdate = originalUpdate;
    BarrierReport.findById = originalFind;
  }
});

test("Issue 82 the approve and reject endpoints return the saved report, or an error", async () => {
  const original = BarrierReport.findOneAndUpdate;

  try {
    BarrierReport.findOneAndUpdate = (filter, update) =>
      chain({ _id: ID, status: update.$set.status });

    const approveRes = mockResponse();
    await approveBarrierReport({ params: { id: ID } }, approveRes);
    assert.equal(approveRes.statusCode, 200);
    assert.equal(approveRes.body.success, true);
    assert.equal(approveRes.body.report.status, "Approved");

    const rejectRes = mockResponse();
    await rejectBarrierReport({ params: { id: ID } }, rejectRes);
    assert.equal(rejectRes.statusCode, 200);
    assert.equal(rejectRes.body.report.status, "Rejected");

    BarrierReport.findOneAndUpdate = () => { throw new Error("db down"); };
    const failRes = mockResponse();
    await approveBarrierReport({ params: { id: ID } }, failRes);
    assert.equal(failRes.statusCode, 500);
    assert.equal(failRes.body.success, false);
  } finally {
    BarrierReport.findOneAndUpdate = original;
  }
});