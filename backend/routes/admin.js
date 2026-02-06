const express = require("express");
const router = express.Router();

// Get all items
router.get("/items", async (req, res) => {
  try {
    const items = await req.Item.findAll({
      order: [['auctionIndex', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await req.User.findAll({
      attributes: ['id', 'username', 'role', 'wallet', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get all bids
router.get("/bids", async (req, res) => {
  try {
    const bids = await req.Bid.findAll({
      include: [
        {
          model: req.User,
          as: 'bidder',
          attributes: ['id', 'username']
        },
        {
          model: req.Item,
          as: 'item',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// Update item status
router.patch("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;
    
    const [updatedRowsCount] = await req.Item.update({
      status,
      isActive
    }, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const updatedItem = await req.Item.findByPk(id);
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Get auction logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await req.Log.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;