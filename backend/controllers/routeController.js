import { calculateRoute } from "../services/routeService.js";

// Story 6 - Issue #60
// Calculate step-by-step directions between two campus places.
// GET /api/routes?from=<place>&to=<place>[&avoidStairs=true]
export async function getRoute(req, res) {
  try {
    // A repeated parameter arrives as an array; treat it as missing.
    const from = typeof req.query.from === "string" ? req.query.from.trim() : "";
    const to = typeof req.query.to === "string" ? req.query.to.trim() : "";

    if (!from) {
      return res.status(400).json({
        success: false,
        message: "A start location (from) is required"
      });
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "A destination (to) is required"
      });
    }

    let avoidStairs = false;
    if (req.query.avoidStairs !== undefined) {
      const flag =
        typeof req.query.avoidStairs === "string"
          ? req.query.avoidStairs.trim().toLowerCase()
          : "";

      if (!["true", "false", "1", "0"].includes(flag)) {
        return res.status(400).json({
          success: false,
          message: "avoidStairs must be true or false"
        });
      }

      avoidStairs = flag === "true" || flag === "1";
    }

    const result = await calculateRoute(from, to, { avoidStairs });

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
        ...(result.stairsRouteExists ? { stairsRouteExists: true } : {})
      });
    }

    return res.status(200).json({
      success: true,
      ...result.route
    });

  } catch (error) {
    console.error("Error calculating route:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate route"
    });
  }
}