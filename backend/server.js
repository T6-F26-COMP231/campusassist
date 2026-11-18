
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import helpRequestRoutes from "./routes/helpRequestRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Parse JSON requests
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusAssist backend is running"
  });
});

// Help request routes (stories 17 and 18)
app.use("/api/help-requests", helpRequestRoutes);

// Start the backend server
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(
      PORT,
      "127.0.0.1",
      () => {
        console.log(
          `CampusAssist server running at http://localhost:${PORT}`
        );
      }
    );

    // Close the database connection on shutdown
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
