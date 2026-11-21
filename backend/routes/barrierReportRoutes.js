import { Router } from "express";
import { createBarrierReport, resolveBarrierReport } from "../controllers/barrierReportController.js";

const router = Router();

// Story 12: Submit a barrier report.
router.post("/", createBarrierReport);

// Story 27: Mark an approved barrier resolved.
router.patch("/:id/resolve", resolveBarrierReport);

export default router;
