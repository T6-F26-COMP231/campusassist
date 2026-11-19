
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";

export async function updateHelpRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID"
      });
    }

    const previousStatus = {
      "On the Way": "Accepted",
      "Completed": "On the Way"
    };

    if (!Object.hasOwn(previousStatus, status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition"
      });
    }

    const request = await HelpRequest.findOneAndUpdate(
      {
        _id: id,
        status: previousStatus[status],
        helperId: { $ne: null }
      },
      {
        $set: { status }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!request) {
      return res.status(409).json({
        success: false,
        message: "Request not found or status transition unavailable"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Help request status updated",
      request
    });

  } catch (error) {
    console.error("Error updating request status:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update request status"
    });
  }
  

}

 // Story 10: Retrieve help request status and details
export async function getHelpRequestStatus(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid help request ID"
      });
    }

    const request = await HelpRequest.findById(id)
      .select(
        "currentLocation description assistanceType status helperId createdAt"
      )
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Help request not found"
      });
    }

    return res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error(
      "Error retrieving help request:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve help request status"
    });
  }
}
