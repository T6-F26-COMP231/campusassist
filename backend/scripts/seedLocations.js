import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Location from "../models/Location.js";

dotenv.config({
  path: new URL("../.env", import.meta.url)
});

// Story 2 - Issue #52
// Populate the existing campus locations collection.

const campusLocations = [
  {
    locationId: "B2-02",
    name: "Bookstore",
    block: "B",
    floor: 2,
    roomNumber: "02"
  },
  {
    locationId: "student-hub",
    name: "Student HUB",
    block: "C",
    floor: 2
  },
  {
    locationId: "A1-04",
    name: "Room A1-04",
    block: "A",
    floor: 1,
    roomNumber: "04"
  },
  {
    locationId: "A1-22",
    name: "Room A1-22",
    block: "A",
    floor: 1,
    roomNumber: "22"
  },
  {
    locationId: "B1-03",
    name: "Room B1-03",
    block: "B",
    floor: 1,
    roomNumber: "03"
  },
  {
    locationId: "B1-04",
    name: "Room B1-04",
    block: "B",
    floor: 1,
    roomNumber: "04"
  }
];

// Insert or update locations without duplicating records.
async function seedLocations() {
  try {
    if (process.env.MONGODB_DB_NAME !== "campusassist_test") {
      throw new Error(
        "Seeding stopped: database must be campusassist_test"
      );
    }

    await connectDB();

    const databaseName = mongoose.connection.db.databaseName;

    if (databaseName !== "campusassist_test") {
      throw new Error(
        `Unexpected database: ${databaseName}`
      );
    }

    console.log("Connected to test database:", databaseName);

    for (const location of campusLocations) {
      await Location.updateOne(
        { locationId: location.locationId },
        { $set: location },
        {
          upsert: true,
          setDefaultsOnInsert: false
        }
      );

      console.log(`Saved: ${location.name}`);
    }

    console.log("Campus locations seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedLocations();
