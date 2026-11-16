
import { Router } from "express";
import { getPendingRequests } from "../controllers/helpRequestController.js";

const router = Router();

router.get("/pending", getPendingRequests);

export default router;
