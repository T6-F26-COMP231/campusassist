import BarrierReport from "../models/BarrierReport.js";

// Same match the pending list uses, so "Approved", "approved" and " APPROVED " all count.
const APPROVED_STATUS_PATTERN = /^\s*approved\s*$/i;

// Story 27: Approved barriers for the Administrator screen, so one can be marked resolved
// even after the app is reloaded. Unlike GET /approved (used by route finding, location only),
// this returns the report id and details. Oldest report first.
export async function getApprovedBarrierReportsForAdmin(req, res) {
  try {
    const found = await BarrierReport.find({ status: APPROVED_STATUS_PATTERN })
      .select("type location description photoName status createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const reports = found.map((report) => ({ ...report, status: "Approved" }));

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error("Error retrieving approved barrier reports for admin:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve approved barrier reports"
    });
  }
}