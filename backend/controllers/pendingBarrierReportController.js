import BarrierReport from "../models/BarrierReport.js";

// Matches "Pending", "pending", " PENDING " and similar, so a report whose
// status was stored with different casing or stray spaces is not missed.
const PENDING_STATUS_PATTERN = /^\s*pending\s*$/i;

// Story 24: Retrieve all pending barrier reports for administrator review.
// Oldest report first, so the report waiting longest is listed first.
export async function getPendingBarrierReports(req, res) {
  try {
    const found = await BarrierReport.find({ status: PENDING_STATUS_PATTERN })
      .select("type location description photoName status createdAt")
      .sort({ createdAt: 1 })
      .lean();

    // Return the status in the schema's exact form, which the admin screen expects.
    const reports = found.map((report) => ({ ...report, status: "Pending" }));

    // No pending reports is a normal result, not an error.
    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });

  } catch (error) {
    console.error("Error retrieving pending barrier reports:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending barrier reports"
    });
  }
}