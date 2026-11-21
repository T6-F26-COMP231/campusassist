
import helpRequestRoutes from "./routes/helpRequestRoutes.js";
import accessibilityRoutes from "./routes/accessibilityRoutes.js";
import barrierReportRoutes from "./routes/barrierReportRoutes.js";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { connectDB } from "./config/db.js";
import locationRoutes from "./routes/locationRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Allow the local frontend and the deployed Netlify website.
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    // (for example, health checks and backend tests).
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  }
}));

// Parse JSON requests
app.use(express.json());

// Story 17: Help request routes
app.use("/api/help-requests", helpRequestRoutes);

// Story 2: Location search by name
app.use("/api/locations", locationRoutes);

// Story 4: Destination accessibility details
app.use("/api/locations", accessibilityRoutes);

// Story 12: Submit a barrier report
app.use("/api/barrier-reports", barrierReportRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusAssist backend is running"
  });
});

// Start the backend server
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `CampusAssist backend running on port ${PORT}`
        );
      }
    );

    // Close database connection on shutdown
    async function shutdown() {
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    }

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);

  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );
    process.exitCode = 1;
  }
}

startServer();
