
import { Router } from "express";
import {
  createBarrierReport,
  resolveBarrierReport,
  getApprovedBarrierReports
} from "../controllers/barrierReportController.js";
import { getPendingBarrierReports } from "../controllers/pendingBarrierReportController.js";
import {
  approveBarrierReport,
  rejectBarrierReport
} from "../controllers/barrierReportReviewController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 24: Retrieve pending barrier reports.
router.get("/pending", getPendingBarrierReports);

// Story 25: Retrieve approved barriers for navigation.
router.get("/approved", getApprovedBarrierReports);

// Story 25 and 26: Approve or reject a pending barrier report.    // NEW (25–28)
router.patch("/:id/approve", approveBarrierReport);
router.patch("/:id/reject", rejectBarrierReport);

// Story 27: Mark an approved barrier as resolved.
router.patch("/:id/resolve", resolveBarrierReport);

export default router;
