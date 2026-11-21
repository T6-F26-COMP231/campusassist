import { Router } from "express";
import { createBarrierReport, resolveBarrierReport } from "../controllers/barrierReportController.js";
import { getPendingBarrierReports } from "../controllers/pendingBarrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 24: Retrieve pending barrier reports.
router.get("/pending", getPendingBarrierReports);

// Story 27: Mark an approved barrier resolved.
router.patch("/:id/resolve", resolveBarrierReport);

export default router;
