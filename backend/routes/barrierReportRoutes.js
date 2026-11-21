import { Router } from "express";
import { createBarrierReport, getApprovedBarrierReports } from "../controllers/barrierReportController.js";
import { getPendingBarrierReports } from "../controllers/pendingBarrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 24: Retrieve pending barrier reports.
router.get("/pending", getPendingBarrierReports);

// Story 25: locations of approved barriers, so a new route can avoid them.
router.get("/approved", getApprovedBarrierReports);

export default router;
