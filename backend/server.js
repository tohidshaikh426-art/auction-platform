// Minimal server for Vercel deployment
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Simple health check
app.get("/", (req, res) => {
  res.json({ message: "Auction Platform Backend - Minimal Version" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bidRoutes = require("./routes/bids");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bids", bidRoutes);

// Export for Vercel
module.exports = serverless(app);

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Minimal server running on port ${PORT}`);
  });
}