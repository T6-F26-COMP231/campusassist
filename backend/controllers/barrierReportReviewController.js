import { listPendingReports, reviewReport } from "../services/barrierReportReviewService.js";

// Story 24: pending barrier reports for the Administrator.
export async function getPendingBarrierReports(req, res) {
  try {
    const reports = await listPendingReports();

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error("Error loading pending barrier reports:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load the pending barrier reports"
    });
  }
}

// Story 25 and 26: approve or reject one pending report.
export async function updateBarrierReportStatus(req, res) {
  try {
    const result = await reviewReport(req.params.id, req.body?.status);

    if (!result.ok) {
      return res.status(result.code).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: `Barrier report ${result.report.status.toLowerCase()}`,
      report: result.report
    });
  } catch (error) {
    console.error("Error updating barrier report status:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update the barrier report"
    });
  }
} 