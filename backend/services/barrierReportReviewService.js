import mongoose from "mongoose";
import BarrierReport from "../models/BarrierReport.js";

// Issue #82 (Story 24, 25, 26): save an approval or rejection so the report leaves the pending list.
export const REVIEW_STATUSES = { approved: "Approved", rejected: "Rejected" };

const NOT_FOUND_MESSAGE = "That report was not found.";
const NOT_PENDING_MESSAGE = "Only pending reports can be approved or rejected.";

const normalizeStatus = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

// Same match the pending list uses: "Pending", "pending", " PENDING ".
const PENDING_STATUS = { $regex: /^\s*pending\s*$/i };

// Moves one Pending report to Approved or Rejected. The Pending check is part of the update itself,
// so a report that was already reviewed (or resolved) is never changed again.
export async function reviewReport(id, requestedStatus) {
  const status = REVIEW_STATUSES[normalizeStatus(requestedStatus)];

  if (!status) {
    return { ok: false, code: 400, message: "Choose approved or rejected." };
  }

  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, code: 404, message: NOT_FOUND_MESSAGE };
  }

  const report = await BarrierReport.findOneAndUpdate(
    { _id: id, status: PENDING_STATUS },
    { $set: { status } },
    { returnDocument: "after", runValidators: true }
  ).lean();

  if (report) return { ok: true, report };

  const existing = await BarrierReport.findById(id).select("status").lean();

  if (!existing) {
    return { ok: false, code: 404, message: NOT_FOUND_MESSAGE };
  }

  return { ok: false, code: 400, message: NOT_PENDING_MESSAGE };
}