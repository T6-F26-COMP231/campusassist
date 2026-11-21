import test from "node:test";
import assert from "node:assert/strict";
import BarrierReport from "../models/BarrierReport.js";
import { listPendingReports, reviewReport } from "../services/barrierReportReviewService.js";
import {
  getPendingBarrierReports,
  updateBarrierReportStatus
} from "../controllers/barrierReportReviewController.js";

const ID = "665f00000000000000000abc";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; }
  };
}

const chain = (result) => {
  const c = { select: () => c, sort: () => c, lean: () => Promise.resolve(result) };
  return c;
};

test("Issue 82 pending list matches Pending in any casing and drops everything else", async () => {
  const original = BarrierReport.find;
  let filter;

  try {
    BarrierReport.find = (query) => {
      filter = query;
      return chain([
        { _id: "1", status: " pending " },
        { _id: "2", status: "Approved" },
        { _id: "3", status: "PENDING" }
      ]);
    };

    const reports = await listPendingReports();

    assert.equal(filter.status.$regex.test("pending"), true);
    assert.equal(filter.status.$regex.test(" PENDING "), true);
    assert.equal(filter.status.$regex.test("Approved"), false);
    assert.deepEqual(reports.map((r) => r._id), ["1", "3"]);
    assert.equal(reports.every((r) => r.status === "Pending"), true);
  } finally {
    BarrierReport.find = original;
  }
});

test("Issue 82 approving and rejecting save Approved and Rejected, whatever the casing sent", async () => {
  const original = BarrierReport.findOneAndUpdate;
  const updates = [];

  try {
    BarrierReport.findOneAndUpdate = (filter, update) => {
      updates.push({ filter, update });
      return chain({ _id: ID, status: update.$set.status });
    };

    const approved = await reviewReport(ID, " Approved ");
    const rejected = await reviewReport(ID, "REJECTED");

    assert.equal(approved.ok && approved.report.status, "Approved");
    assert.equal(rejected.ok && rejected.report.status, "Rejected");
    assert.equal(updates[0].filter.status.$regex.test("Pending"), true);
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
    assert.equal((await reviewReport(ID, "rejected")).code, 409);

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

test("Issue 82 controllers return the report list, the updated report, and errors", async () => {
  const originalFind = BarrierReport.find;
  const originalUpdate = BarrierReport.findOneAndUpdate;

  try {
    BarrierReport.find = () => chain([]);
    const listRes = mockResponse();
    await getPendingBarrierReports({}, listRes);
    assert.equal(listRes.statusCode, 200);
    assert.deepEqual(listRes.body, { success: true, reports: [] });

    BarrierReport.findOneAndUpdate = () => chain({ _id: ID, status: "Rejected" });
    const okRes = mockResponse();
    await updateBarrierReportStatus({ params: { id: ID }, body: { status: "rejected" } }, okRes);
    assert.equal(okRes.statusCode, 200);
    assert.equal(okRes.body.report.status, "Rejected");

    BarrierReport.findOneAndUpdate = () => { throw new Error("db down"); };
    const failRes = mockResponse();
    await updateBarrierReportStatus({ params: { id: ID }, body: { status: "approved" } }, failRes);
    assert.equal(failRes.statusCode, 500);
    assert.equal(failRes.body.success, false);
  } finally {
    BarrierReport.find = originalFind;
    BarrierReport.findOneAndUpdate = originalUpdate;
  }
});