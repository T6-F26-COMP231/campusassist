import mongoose from "mongoose";

// Story 4 - Issue #44
// Store campus destination accessibility details in MongoDB.

const locationSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    accessibility: {
      elevator: {
        type: Boolean,
        default: false
      },
      washroom: {
        type: Boolean,
        default: false
      },
      ramp: {
        type: Boolean,
        default: false
      },
      autoDoor: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

const Location =
  mongoose.models.Location ||
  mongoose.model("Location", locationSchema);

export default Location;
