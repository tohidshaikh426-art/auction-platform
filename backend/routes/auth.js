const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sequelize } = require("../config/db");
const User = require("../models/User")(sequelize, require("sequelize").DataTypes);

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

      // Find or create admin user
      let adminUser = await User.findOne({ where: { role: "admin" } });
      
      if (!adminUser) {
        // Create admin on first login
        adminUser = await User.create({
          username: ADMIN_CREDENTIAL,
          password: await bcrypt.hash("admin_internal_secret", 10),
          role: "admin",
          wallet: 100000,
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: adminUser.id, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        message: "Admin login successful",
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          wallet: adminUser.wallet,
        },
      });
    }

    // Bidder login - Allow CC code/name
    if (role === "bidder") {
      if (!validator.isLength(credential, { min: 2, max: 50 })) {
        return res.status(400).json({ error: "CC name must be 2-50 characters" });
      }

      // Find or create bidder
      let bidder = await User.findOne({ where: { username: credential, role: "bidder" } });

      if (!bidder) {
        // Auto-create bidder account
        bidder = await User.create({
          username: credential,
          password: await bcrypt.hash(`bidder_${credential}_secret`, 10),
          role: "bidder",
          wallet: 10000, // Initial wallet
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: bidder.id, role: bidder.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        message: "Bidder login successful",
        token,
        user: {
          id: bidder.id,
          username: bidder.username,
          role: bidder.role,
          wallet: bidder.wallet,
        },
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
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      wallet: user.wallet,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;