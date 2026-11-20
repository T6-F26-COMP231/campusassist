
import Location from "../models/Location.js";

// Story 4 - Issue #44
// Retrieve destination accessibility details from MongoDB Atlas.

const FEATURES = [
  { id: "elevator", label: "Elevators" },
  { id: "washroom", label: "Accessible washrooms" },
  { id: "ramp", label: "Ramps" },
  { id: "autoDoor", label: "Auto doors" }
];

export async function getAccessibilityReport(placeId) {
  // Retrieve the destination from MongoDB.
  const place = await Location.findOne({
    locationId: placeId
  }).lean();

  if (!place) {
    return {
      ok: false,
      error: "That place is not in the campus records."
    };
  }

  // Get the accessibility information stored for this location.
  const items = FEATURES.map((feature) => ({
    id: feature.id,
    label: feature.label,
    available: Boolean(place.accessibility?.[feature.id])
  }));

  return {
    ok: true,
    id: place.locationId,
    name: place.name,
    items,
    availableCount: items.filter((item) => item.available).length,
    total: items.length
  };
}
