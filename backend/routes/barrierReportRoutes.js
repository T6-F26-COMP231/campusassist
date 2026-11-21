import { Router } from "express";
import { createBarrierReport, getApprovedBarrierReports } from "../controllers/barrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 25: locations of approved barriers, so a new route can avoid them.
router.get("/approved", getApprovedBarrierReports);

export default router;
