import { Router } from "express";
import { searchLocations } from "../controllers/locationController.js";

const router = Router();

// Story 2 - Issue #51: Search locations by name
// GET /api/locations/search?name=...
router.get("/search", searchLocations);

export default router;