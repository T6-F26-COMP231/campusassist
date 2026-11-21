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
    const { type, location, description, photoName } = req.body || {};
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
