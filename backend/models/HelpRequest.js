
import mongoose from "mongoose";

const helpRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    currentLocation: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    assistanceType: {
      type: String,
      enum: [
        "Standard Guiding",
        "Mobility Assistance",
        "Other"
      ],
      required: true,
      default: "Standard Guiding"
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "On the Way",
        "Arrived",
        "Completed",
        "Cancelled"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const HelpRequest =
  mongoose.models.HelpRequest ||
  mongoose.model("HelpRequest", helpRequestSchema);

export default HelpRequest;
