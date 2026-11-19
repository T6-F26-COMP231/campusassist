
import { Router } from "express";

import {
  getPendingRequests,
  acceptHelpRequest,
  createHelpRequest
} from "../controllers/helpRequestController.js";

import {
  getHelpRequestStatus
} from "../controllers/helpRequestStatusController.js";

const router = Router();

// Story 8: Submit help request
router.post("/", createHelpRequest);

// Story 17: Retrieve pending requests
router.get("/pending", getPendingRequests);

// Story 18: Accept request
router.patch("/:id/accept", acceptHelpRequest);

// Story 10: Retrieve request status
router.get("/:id/status", getHelpRequestStatus);

export default router;
