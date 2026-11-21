import { Router } from "express";
import { getRoute } from "../controllers/routeController.js";

const router = Router();

// Story 6 - Issue #60: Calculate a route between two locations
// GET /api/routes?from=...&to=...&avoidStairs=true
router.get("/", getRoute);

export default router;