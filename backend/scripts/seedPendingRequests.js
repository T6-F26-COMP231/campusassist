// Seeds a few Pending help requests so the frontend flow can be tried by hand.
//   npm run seed          add sample requests (blocks A, B, C)
//   npm run seed -- --clear   remove only the requests this script created
// Seeded rows are tagged with SEED_TAG in `description`, so --clear never
// touches real data.
import "dotenv/config";
import mongoose from "mongoose";
import HelpRequest from "../models/HelpRequest.js";

const SEED_TAG = "[seed]";

const SAMPLES = [
  { currentLocation: "A Block, Floor 1", description: "Needs help finding room A112", assistanceType: "Standard Guiding" },
  { currentLocation: "B Block, Floor 1", description: "Needs help with classroom door", assistanceType: "Mobility Assistance" },
  { currentLocation: "b3-74", description: "Lost, trying to reach the library", assistanceType: "Standard Guiding" },
  { currentLocation: "C Block, Floor 2", description: "Elevator is out of service", assistanceType: "Other" },
];

async function main() {
  const { MONGODB_URI, MONGODB_DB_NAME } = process.env;
  if (!MONGODB_URI || !MONGODB_DB_NAME) {
    throw new Error("MONGODB_URI and MONGODB_DB_NAME are required (see backend/.env.example)");
  }
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME, serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to database "${MONGODB_DB_NAME}"`);
const tagged = { description: { $regex: /^\[seed\]/ } };

  if (process.argv.includes("--clear")) {
    const { deletedCount } = await HelpRequest.deleteMany(tagged);
    console.log(`Removed ${deletedCount} seeded request(s).`);
    return;
  }

  // Replace earlier seeds so every run starts from the same Pending state.
  await HelpRequest.deleteMany(tagged);
  const created = await HelpRequest.insertMany(
    SAMPLES.map((s) => ({ ...s, description: `${SEED_TAG} ${s.description}`, status: "Pending", helperId: null }))
  );
  created.forEach((r) => console.log(`  ${r._id}  ${r.currentLocation}`));

  // Accept needs a valid ObjectId for the helper; there is no User model yet.
  console.log(`\nSeeded ${created.length} Pending request(s).`);
  console.log(`Use this helper id in frontend/.env.local:\n  VITE_HELPER_ID=${new mongoose.Types.ObjectId()}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
