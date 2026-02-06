const express = require("express");
const router = express.Router();

// Get all auction items
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

// Place a bid
router.post("/:id/bid", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, amount } = req.body;

    // Validate inputs
    if (!userId || !amount) {
      return res.status(400).json({ error: "User ID and amount required" });
    }

    // Find the item
    const item = await req.Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if bid amount is higher than current bid
    if (amount <= item.currentBid) {
      return res.status(400).json({ error: "Bid amount must be higher than current bid" });
    }

    // Find the user
    const user = await req.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has enough money
    if (user.wallet < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Start a transaction to ensure data consistency
    const transaction = await req.sequelize.transaction();

    try {
      // Create the bid
      const bid = await req.Bid.create({
        amount,
        bidderId: userId,
        itemId: id
      }, { transaction });

      // Update the item with new bid
      await req.Item.update({
        currentBid: amount,
        winnerId: userId
      }, {
        where: { id },
        transaction
      });

      // Deduct from user's wallet
      await req.User.update({
        wallet: user.wallet - amount
      }, {
        where: { id: userId },
        transaction
      });

      await transaction.commit();

      // Respond with success
      res.json({
        message: "Bid placed successfully",
        bid: bid.toJSON(),
        updatedItem: await req.Item.findByPk(id)
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
});

// Get bid history for an item
router.get("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const bids = await req.Bid.findAll({
      where: { itemId: id },
      include: [{
        model: req.User,
        as: 'bidder',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(bids);
  } catch (error) {
    console.error("Error fetching bid history:", error);
    res.status(500).json({ error: "Failed to fetch bid history" });
  }
});

// Get user's bid history
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bids = await req.Bid.findAll({
      where: { bidderId: userId },
      include: [{
        model: req.Item,
        as: 'item',
        attributes: ['id', 'name', 'image']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(bids);
  } catch (error) {
    console.error("Error fetching user bids:", error);
    res.status(500).json({ error: "Failed to fetch user bids" });
  }
});

module.exports = router;