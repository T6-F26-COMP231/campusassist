import mongoose from "mongoose";

// Story 12 and Story 38 share this collection.
// A faculty classroom is stored in location. There is no separate faculty collection.
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
    collection: "barrierreports",
    timestamps: true
  }
);

const BarrierReport =
  mongoose.models.BarrierReport ||
  mongoose.model("BarrierReport", barrierReportSchema);

export default BarrierReport;
