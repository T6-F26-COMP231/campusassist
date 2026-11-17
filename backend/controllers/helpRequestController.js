import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";

// Story 17: Retrieve pending requests in the helper's block
export async function getPendingRequests(req, res) {
  try {
    const block = String(req.query.block || "")
      .trim()
      .toUpperCase();

    // Only campus blocks A, B and C are supported.
    if (!["A", "B", "C"].includes(block)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid campus block: A, B or C"
      });
    }

    // Match locations such as "B Block, Floor 1" or "b3-74".
    const locationPattern = new RegExp(
      `^\\s*(?:${block}\\s*Block\\b|Block\\s*${block}\\b|${block}\\s*[- ]?\\d)`,
      "i"
    );

    const requests = await HelpRequest.find({
      status: "Pending",
      helperId: null,
      currentLocation: locationPattern
    })
      .select(
        "userId currentLocation description assistanceType status createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      block,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error("Error retrieving requests:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending requests"
    });
  }
}

 // Story 18: Accept a pending help request
export async function acceptHelpRequest(req, res) {
  try {
    const { id } = req.params;

    // Temporary Iteration 1 input.
    // Authentication will later supply helperId.
    const { helperId } = req.body || {};

    // Validate the request and helper IDs
    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(helperId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid request and helper IDs are required"
      });
    }

    // Accept only requests that are still pending
    const request = await HelpRequest.findOneAndUpdate(
      {
        _id: id,
        status: "Pending",
        helperId: null
      },
      {
        $set: {
          status: "Accepted",
          helperId
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    // Prevent accepting an unavailable request
    if (!request) {
      return res.status(409).json({
        success: false,
        message: "Request is unavailable or already accepted"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Help request accepted successfully",
      request
    });

  } catch (error) {
    console.error("Error accepting help request:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to accept help request"
    });
  }
}
