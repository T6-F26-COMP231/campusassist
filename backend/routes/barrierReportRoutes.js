import { Router } from "express";
import { createBarrierReport } from "../controllers/barrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

export default router;
