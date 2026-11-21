import mongoose from "mongoose";
import BarrierReport from "../models/BarrierReport.js";

// Issue #82 (Story 24): approved or rejected reports must leave the pending list.
export const REVIEW_STATUSES = { approved: "Approved", rejected: "Rejected" };

export const normalizeStatus = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

// Matches "Pending", "pending", " PENDING " and so on.
const PENDING_STATUS = { $regex: /^\s*pending\s*$/i };

// Pending reports only, oldest first. The second filter is a safety net for odd stored values.
export async function listPendingReports() {
  const reports = await BarrierReport.find({ status: PENDING_STATUS })
    .select("type location description photoName status createdAt")
    .sort({ createdAt: 1 })
    .lean();

  return reports
    .filter((report) => normalizeStatus(report.status) === "pending")
    .map((report) => ({ ...report, status: "Pending" }));
}

// Moves one Pending report to Approved or Rejected. The status check is part of the update itself,
// so a report that was already reviewed is never changed again.
export async function reviewReport(id, requestedStatus) {
  const status = REVIEW_STATUSES[normalizeStatus(requestedStatus)];

  if (!status) {
    return { ok: false, code: 400, message: "Choose approved or rejected." };
  }

  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, code: 404, message: "That report was not found." };
  }

  const report = await BarrierReport.findOneAndUpdate(
    { _id: id, status: PENDING_STATUS },
    { $set: { status } },
    { returnDocument: "after", runValidators: true }
  ).lean();

  if (report) return { ok: true, report };

  const existing = await BarrierReport.findById(id).select("status").lean();

  if (!existing) {
    return { ok: false, code: 404, message: "That report was not found." };
  }

  return {
    ok: false,
    code: 409,
    message: "Only pending reports can be approved or rejected."
  };
}