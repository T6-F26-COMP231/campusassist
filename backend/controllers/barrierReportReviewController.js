import { reviewReport } from "../services/barrierReportReviewService.js";

function reviewHandler(status, errorMessage) {
  return async function handler(req, res) {
    try {
      const result = await reviewReport(req.params.id, status);

      if (!result.ok) {
        return res.status(result.code).json({ success: false, message: result.message });
      }

      return res.status(200).json({
        success: true,
        message: `Barrier report ${result.report.status.toLowerCase()}`,
        report: result.report
      });
    } catch (error) {
      console.error(`Error saving barrier report review (${status}):`, error.message);

      return res.status(500).json({ success: false, message: errorMessage });
    }
  };
}

// Story 25: Approve one pending barrier report.
export const approveBarrierReport = reviewHandler("approved", "Unable to approve the barrier report");

// Story 26: Reject one pending barrier report.
export const rejectBarrierReport = reviewHandler("rejected", "Unable to reject the barrier report");