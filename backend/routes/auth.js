const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const ADMIN_CREDENTIAL = "ITCS Committee"; // Confidential admin credential

// Login - No password required, just credential (CC code for bidders, "ITCS Committee" for admin)
router.post("/login", async (req, res) => {
  try {
    const { username, role } = req.body;

    // Validation
    if (!username || !role) {
      return res.status(400).json({ error: "Credential and role required" });
    }

    const credential = username.trim();

    // Admin credential check
    if (role === "admin") {
      if (credential !== ADMIN_CREDENTIAL) {
        return res.status(401).json({ error: "Invalid admin credential" });
      }

      // Mock admin user
      const adminUser = {
        id: 1,
        username: credential,
        role: "admin",
        wallet: 100000
      };

      // Generate token
      const token = jwt.sign(
        { id: adminUser.id, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        message: "Admin login successful",
        token,
        user: adminUser
      });
    }

    // Bidder login - Allow CC code/name
    if (role === "bidder") {
      if (!validator.isLength(credential, { min: 2, max: 50 })) {
        return res.status(400).json({ error: "CC name must be 2-50 characters" });
      }

      // Mock bidder user
      const bidder = {
        id: Date.now(), // Simple mock ID
        username: credential,
        role: "bidder",
        wallet: 10000
      };

      // Generate token
      const token = jwt.sign(
        { id: bidder.id, role: bidder.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        message: "Bidder login successful",
        token,
        user: bidder
      });
    }

    res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get user info (optional)
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Mock user response
    const user = {
      id: decoded.id,
      username: decoded.role === "admin" ? "ITCS Committee" : `bidder_${decoded.id}`,
      role: decoded.role,
      wallet: decoded.role === "admin" ? 100000 : 10000
    };

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;