import { Router } from "express";
import { getDestinationAccessibility } from "../controllers/accessibilityController.js";

const router = Router();

// Story 4 - Issue #44: Retrieve destination accessibility details
router.get("/:placeId/accessibility", getDestinationAccessibility);

export default router;
