import { Router } from "express";
import { createBarrierReport, getApprovedBarrierReports } from "../controllers/barrierReportController.js";
import {
  getPendingBarrierReports,
  updateBarrierReportStatus
} from "../controllers/barrierReportReviewController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

import {
  getPendingBarrierReports,
  updateBarrierReportStatus
} from "../controllers/barrierReportReviewController.js";

// Story 24: Retrieve pending barrier reports.
router.get("/pending", getPendingBarrierReports);

// Story 25: locations of approved barriers, so a new route can avoid them.
router.get("/approved", getApprovedBarrierReports);

export default router;
