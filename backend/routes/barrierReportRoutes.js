import { Router } from "express";
import { createBarrierReport, rejectBarrierReport } from "../controllers/barrierReportController.js";
import { getPendingBarrierReports } from "../controllers/pendingBarrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 24: Retrieve pending barrier reports.
router.get("/pending", getPendingBarrierReports);

// Story 26: Change a pending report to Rejected.
router.patch("/:id/reject", rejectBarrierReport);

export default router;
