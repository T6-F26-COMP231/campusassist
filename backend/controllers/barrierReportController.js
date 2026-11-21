import mongoose from "mongoose";
import BarrierReport from "../models/BarrierReport.js";

const BARRIER_TYPES = [
  "broken-elevator",
  "blocked-entrance",
  "construction-closure",
  "broken-door",
  "blocked-ramp",
  "other"
];

const MISSING_LOCATION_MESSAGE =
  "A report without a location is not accepted. Tell us where the barrier is.";
const MISSING_TYPE_MESSAGE = "Choose a barrier type.";
const DESCRIPTION_LIMIT = 300;

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// Story 12: Save a barrier report for an administrator to review.
export async function createBarrierReport(req, res) {
  try {
    const { role, type, location, description, photoName } = req.body || {};
    // Story 38 - Accept faculty staff and campus user submissions.
    const reporterRole = role || "campus-user";

    if (!["campus-user", "faculty-staff"].includes(reporterRole)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid reporter role."
      });
    }

    const place = clean(location);
    const details = clean(description);

    if (!place) {
      return res.status(400).json({
        success: false,
        message: MISSING_LOCATION_MESSAGE
      });
    }

    if (!BARRIER_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: MISSING_TYPE_MESSAGE
      });
    }

    if (details.length > DESCRIPTION_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Keep the description to ${DESCRIPTION_LIMIT} characters or fewer.`
      });
    }

    const report = await BarrierReport.create({
      type,
      location: place,
      description: details,
      photoName: clean(photoName),
      status: "Pending"
    });

    return res.status(201).json({
      success: true,
      message: "Barrier report saved for review",
      report
    });
  } catch (error) {
    console.error("Error saving barrier report:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save the barrier report"
    });
  }
}


const NOT_FOUND_MESSAGE = "That report was not found.";
const ONLY_APPROVED_MESSAGE = "Only approved barriers can be marked resolved.";
const ALREADY_RESOLVED_MESSAGE = "This barrier is already resolved.";

// Story 27: Mark one approved barrier resolved in the existing collection.
export async function resolveBarrierReport(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: NOT_FOUND_MESSAGE
      });
    }

    const report = await BarrierReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: NOT_FOUND_MESSAGE
      });
    }

    if (report.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: ALREADY_RESOLVED_MESSAGE
      });
    }

    if (report.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: ONLY_APPROVED_MESSAGE
      });
    }

    report.status = "Resolved";
    await report.save();

    return res.status(200).json({
      success: true,
      message: "Barrier report marked resolved",
      report
    });
  } catch (error) {
    console.error("Error resolving barrier report:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to mark the barrier resolved"
    });
  }
}

// Story 25: The walking route reads approved barriers only.
// Pending, rejected and resolved reports are excluded.
export async function getApprovedBarrierReports(req, res) {
  try {
    const reports = await BarrierReport.find({ status: "Approved" })
      .select("location status")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports: reports.map((report) => ({
        location: report.location,
        status: "Approved"
      }))
    });
  } catch (error) {
    console.error("Error reading approved barrier reports:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load approved barrier reports"
    });
  }
}

  }
}
