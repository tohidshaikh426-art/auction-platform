const express = require("express");
const router = express.Router();

// Mock data store
let mockItems = [
  { id: 1, name: "Smartphone", basePrice: 50, currentBid: 50, auctionIndex: 1, isActive: true, category: "technology", status: "active", bidCount: 0, image: "/images/phone.png" },
  { id: 2, name: "Laptop", basePrice: 100, currentBid: 100, auctionIndex: 2, isActive: true, category: "technology", status: "active", bidCount: 0, image: "/images/laptop.png" },
  { id: 3, name: "Headphones", basePrice: 30, currentBid: 30, auctionIndex: 3, isActive: true, category: "technology", status: "active", bidCount: 0, image: "/images/headphones.png" }
];

let mockUsers = [
  { id: 1, username: "admin", role: "admin", wallet: 100000, createdAt: new Date().toISOString() },
  { id: 2, username: "bidder1", role: "bidder", wallet: 10000, createdAt: new Date().toISOString() }
];

let mockBids = [];

// Get all items
router.get("/items", (req, res) => {
  try {
    res.json(mockItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get all users
router.get("/users", (req, res) => {
  try {
    res.json(mockUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get all bids
router.get("/bids", (req, res) => {
  try {
    res.json(mockBids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// Update item status
router.patch("/items/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;
    
    const item = mockItems.find(item => item.id == id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    if (status !== undefined) item.status = status;
    if (isActive !== undefined) item.isActive = isActive;
    
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Get auction logs
router.get("/logs", (req, res) => {
  try {
    // Mock logs
    const logs = [
      { id: 1, action: "user_login", userId: 1, details: { username: "admin" }, createdAt: new Date().toISOString() },
      { id: 2, action: "bid_placed", userId: 2, itemId: 1, details: { amount: 75 }, createdAt: new Date().toISOString() }
    ];
    res.json(logs.slice(0, 100)); // Limit to last 100
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;