import { Router } from "express";
import { approveBarrierReport, createBarrierReport } from "../controllers/barrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 25: Change a pending report to Approved.
router.patch("/:id/approve", approveBarrierReport);

export default router;
