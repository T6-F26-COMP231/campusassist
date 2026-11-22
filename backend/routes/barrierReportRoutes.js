
import { Router } from "express";
import {
  createBarrierReport,
  resolveBarrierReport,
  getApprovedBarrierReports
} from "../controllers/barrierReportController.js";
import { getPendingBarrierReports } from "../controllers/pendingBarrierReportController.js";
import { getApprovedBarrierReportsForAdmin } from "../controllers/approvedBarrierReportAdminController.js";
import {
  approveBarrierReport,
  rejectBarrierReport
} from "../controllers/barrierReportReviewController.js";

const router = Router();

// Story 12: Submit barrier reports.
router.post("/", createBarrierReport);

// Story 24: Retrieve pending barrier reports.
router.get("/pending", getPendingBarrierReports);

// Story 25: Retrieve approved barriers for navigation.
router.get("/approved", getApprovedBarrierReports);

// Administrator: Retrieve approved barrier reports.
router.get("/approved/admin", getApprovedBarrierReportsForAdmin);

// Story 25: Approve a pending barrier report.
router.patch("/:id/approve", approveBarrierReport);

// Story 26: Reject a pending barrier report.
router.patch("/:id/reject", rejectBarrierReport);

// Story 27: Resolve an approved barrier report.
router.patch("/:id/resolve", resolveBarrierReport);

export default router;
