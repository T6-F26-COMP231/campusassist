
import { Router } from "express";

import {
  getPendingRequests,
  acceptHelpRequest
} from "../controllers/helpRequestController.js";

const router = Router();

// Story 17: Retrieve pending help requests
router.get("/pending", getPendingRequests);

// Story 18: Accept a pending help request
router.patch("/:id/accept", acceptHelpRequest);

export default router;
