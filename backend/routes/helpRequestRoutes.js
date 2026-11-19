
import { Router } from "express";
import {
  getHelpRequestStatus
} from "../controllers/helpRequestStatusController.js";

import {
  getPendingRequests,
  acceptHelpRequest
} from "../controllers/helpRequestController.js";

const router = Router();

// Story 17: Retrieve pending help requests
router.get("/pending", getPendingRequests);

// Story 18: Accept a pending help request
router.patch("/:id/accept", acceptHelpRequest);

// Story 10: Retrieve a specific help request's status
router.get("/:id/status", getHelpRequestStatus);
export default router;
