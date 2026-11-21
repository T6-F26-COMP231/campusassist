import mongoose from "mongoose";

// Story 12: A barrier report saved for an administrator to review.
const barrierReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "broken-elevator",
        "blocked-entrance",
        "construction-closure",
        "broken-door",
        "blocked-ramp",
        "other"
      ]
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300
    },

    photoName: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Resolved"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const BarrierReport =
  mongoose.models.BarrierReport ||
  mongoose.model("BarrierReport", barrierReportSchema);

export default BarrierReport;
