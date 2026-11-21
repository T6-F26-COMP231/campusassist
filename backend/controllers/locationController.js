import Location from "../models/Location.js";

// Story 2 - Issue #51
// Search campus locations by name.
export async function searchLocations(req, res) {
  try {
    // A repeated parameter (?name=a&name=b) arrives as an array; treat it as missing.
    const name =
      typeof req.query.name === "string"
        ? req.query.name.trim().replace(/\s+/g, " ")
        : "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Enter a location name to search."
      });
    }

    // Escape regex characters so input such as "B1-03" or "(" is matched as plain text.
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const locations = await Location.find({
      name: { $regex: escaped, $options: "i" }
    })
      .select("locationId name block floor roomNumber")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      query: name,
      count: locations.length,
      locations
    });

  } catch (error) {
    console.error("Error searching locations:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to search locations"
    });
  }
}