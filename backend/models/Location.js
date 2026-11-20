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

    // Story 2 - Issue #52: Campus location details
    block: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ["A", "B", "C", "D", "E", "L", "P", "R", "G"]
    },

    floor: {
      type: Number,
      min: 0
    },

    roomNumber: {
      type: String,
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
