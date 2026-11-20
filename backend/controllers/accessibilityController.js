import { getAccessibilityReport } from "../services/accessibilityService.js";

// Story 4 - Issue #44
// Retrieve accessibility details for a destination.
export async function getDestinationAccessibility(req, res) {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: "A destination ID is required"
      });
    }

    const result = await getAccessibilityReport(placeId);

    if (!result.ok) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    return res.status(200).json({
      success: true,
      location: {
        id: result.id,
        name: result.name
      },
      features: result.items,
      availableCount: result.availableCount,
      total: result.total
    });

  } catch (error) {
    console.error(
      "Error retrieving destination accessibility:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve destination accessibility details"
    });
  }
}
