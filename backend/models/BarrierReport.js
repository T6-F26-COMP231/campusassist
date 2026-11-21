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

// Story 24: read Pending reports from this same collection.
// Approved, rejected, and resolved reports are not included. Oldest report first.
barrierReportSchema.statics.findPending = function () {
  return this.find({ status: "Pending" })
    .select("type location description photoName status createdAt")
    .sort({ createdAt: 1 })
    .lean();
};

const BarrierReport =
  mongoose.models.BarrierReport ||
  mongoose.model("BarrierReport", barrierReportSchema);

export default BarrierReport;
