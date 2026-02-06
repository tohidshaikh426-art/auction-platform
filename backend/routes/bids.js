const express = require("express");
const router = express.Router();

// Mock data store (in memory, will reset with each function invocation)
let mockItems = [
  { id: 1, name: "Smartphone", basePrice: 50, currentBid: 50, auctionIndex: 1, isActive: true, category: "technology", status: "active", bidCount: 0, image: "/images/phone.png" },
  { id: 2, name: "Laptop", basePrice: 100, currentBid: 100, auctionIndex: 2, isActive: true, category: "technology", status: "active", bidCount: 0, image: "/images/laptop.png" },
  { id: 3, name: "Headphones", basePrice: 30, currentBid: 30, auctionIndex: 3, isActive: true, category: "technology", status: "active", bidCount: 0, image: "/images/headphones.png" }
];

let mockBids = [];

// Get all auction items
router.get("/items", (req, res) => {
  try {
    res.json(mockItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Place a bid
router.post("/:id/bid", (req, res) => {
  try {
    const { id } = req.params;
    const { userId, amount } = req.body;

    // Validate inputs
    if (!userId || !amount) {
      return res.status(400).json({ error: "User ID and amount required" });
    }

    // Find the item
    const item = mockItems.find(item => item.id == id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if bid amount is higher than current bid
    if (amount <= item.currentBid) {
      return res.status(400).json({ error: "Bid amount must be higher than current bid" });
    }

    // Create the bid
    const bid = {
      id: mockBids.length + 1,
      amount,
      bidderId: userId,
      itemId: parseInt(id),
      createdAt: new Date().toISOString()
    };
    
    mockBids.push(bid);

    // Update the item with new bid
    item.currentBid = amount;
    item.winnerId = userId;
    item.bidCount = (item.bidCount || 0) + 1;

    // Respond with success
    res.json({
      message: "Bid placed successfully",
      bid,
      updatedItem: item
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
});

// Get bid history for an item
router.get("/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    
    const itemBids = mockBids.filter(bid => bid.itemId == id);
    
    res.json(itemBids);
  } catch (error) {
    console.error("Error fetching bid history:", error);
    res.status(500).json({ error: "Failed to fetch bid history" });
  }
});

// Get user's bid history
router.get("/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    
    const userBids = mockBids.filter(bid => bid.bidderId == userId);
    
    res.json(userBids);
  } catch (error) {
    console.error("Error fetching user bids:", error);
    res.status(500).json({ error: "Failed to fetch user bids" });
  }
});

module.exports = router;