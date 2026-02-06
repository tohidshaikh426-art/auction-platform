const calculateNextBid = (currentBid) => {
  if (currentBid < 500) return currentBid + 50;
  return currentBid + 100;
};

// Socket authentication middleware
const verifyAdminSocket = (socket, callback) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return callback(new Error("No token provided"));
  }

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");
    
    if (decoded.role !== "admin") {
      return callback(new Error("Admin access required"));
    }
    
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    callback();
  } catch (err) {
    callback(new Error("Invalid token: " + err.message));
  }
};

module.exports = (io, Item, Bid, User, Log, sequelize) => {
  let currentItemId = null;
  let timerInterval = null;
  let itemStartTime = null;
  let unsoldItems = [];
  let firstBidTime = null;

  const broadcastState = async () => {
    if (!currentItemId) return;

    const item = await Item.findByPk(currentItemId, {
      include: [
        {
          model: Bid,
          as: "Bids",
          include: [{ model: User, attributes: ["username"] }],
          order: [["amount", "DESC"]],
        },
      ],
    });

    const topBid = item.Bids[0] || null;
    const leadingBidder = topBid ? topBid.User : null;

    const now = new Date();
    const timerSeconds = item.timerEnd ? Math.max(0, Math.floor((item.timerEnd - now) / 1000)) : 0;
    const hasBids = item.Bids.length > 0;
    const timeSinceFirstBid = firstBidTime ? Math.floor((now - firstBidTime) / 1000) : null;

    io.emit("auction:state", {
      currentItemId: item.id,
      itemName: item.name,
      image: item.image,
      basePrice: item.basePrice,
      currentBid: item.currentBid,
      leadingBidder: leadingBidder?.username || null,
      timerEnd: item.timerEnd,
      timerSeconds,
      hasBids,
      timeSinceFirstBid,
      status: item.status,
      category: item.category,
      bids: item.Bids.map((b) => ({
        amount: b.amount,
        bidder: b.User.username,
        timestamp: b.createdAt,
      })),
    });
  };

  const getNextItems = async (itemType = "all") => {
    if (itemType === "unsold") {
      return await Item.findAll({
        where: { status: "unsold" },
        order: [["auctionIndex", "ASC"]],
      });
    }

    // Get active items sorted: Products first, then Technology
    const products = await Item.findAll({
      where: { isActive: true, category: "product" },
      order: [["auctionIndex", "ASC"]],
    });

    const technologies = await Item.findAll({
      where: { isActive: true, category: "technology" },
      order: [["auctionIndex", "ASC"]],
    });

    return [...products, ...technologies];
  };

  const startItemAuction = async (itemId) => {
    if (timerInterval) clearInterval(timerInterval);

    currentItemId = itemId;
    firstBidTime = null;
    itemStartTime = new Date();

    const now = new Date();
    const timerEnd = new Date(now.getTime() + 35_000); // 35s timer

    await Item.update(
      { timerEnd, status: "active" },
      { where: { id: currentItemId } }
    );

    // Update timer every 500ms
    timerInterval = setInterval(async () => {
      const item = await Item.findByPk(currentItemId, {
        include: [
          {
            model: Bid,
            as: "Bids",
            include: [{ model: User, attributes: ["username"] }],
            order: [["amount", "DESC"]],
          },
        ],
      });

      if (!item) return;

      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((item.timerEnd - now) / 1000));

      // Timer ended
      if (timeRemaining === 0) {
        clearInterval(timerInterval);
        await broadcastState();

        // Notify admin that timer is done and they can choose sold/unsold
        io.emit("auction:timer:finished", {
          itemId: item.id,
          itemName: item.name,
          hasBids: item.Bids.length > 0,
          winningBidder: item.Bids.length > 0 ? item.Bids[0].User.username : null,
          winningBid: item.currentBid,
        });
      } else {
        await broadcastState();
      }
    }, 500);

    await broadcastState();
  };

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Authenticate on connection
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        console.log(`Authenticated user: ${socket.userId} (${socket.userRole})`);
      } catch (err) {
        console.log("Token verification failed:", err.message);
        socket.userRole = "guest";
      }
    } else {
      socket.userRole = "guest";
    }

    socket.on("join:auction", async () => {
      try {
        await broadcastState();
      } catch (err) {
        console.error("Join auction error:", err);
        socket.emit("error", { message: "Failed to join auction" });
      }
    });

    socket.on("bid:place", async ({ userId, amount }) => {
      try {
        // Validate input
        if (!userId || !amount || typeof userId !== "number" || typeof amount !== "number") {
          socket.emit("bid:error", "Invalid bid information");
          return;
        }

        if (amount <= 0) {
          socket.emit("bid:error", "Bid amount must be positive");
          return;
        }

        if (!currentItemId) {
          socket.emit("bid:error", "No active item.");
          return;
        }

        const user = await User.findByPk(userId);
        const item = await Item.findByPk(currentItemId);

        if (!user || !item) {
          socket.emit("bid:error", "User or item not found");
          return;
        }

        // Calculate next bid increment
        let nextBid;
        if (item.currentBid < 500) {
          nextBid = item.currentBid + 50;
        } else {
          nextBid = item.currentBid + 100;
        }

        if (amount !== nextBid) {
          socket.emit("bid:error", `Bid must be ₹${nextBid}.`);
          return;
        }

        if (user.wallet < amount) {
          socket.emit("bid:error", "Insufficient wallet balance.");
          return;
        }

        // Track first bid time
        if (!firstBidTime) {
          firstBidTime = new Date();
        }

        // Lock with transaction
        const transaction = await sequelize.transaction();
        try {
          const bid = await Bid.create(
            {
              amount,
              bidderId: userId,
              itemId: currentItemId,
            },
            { transaction }
          );

          await User.update(
            { wallet: user.wallet - amount },
            { where: { id: userId }, transaction }
          );

          await Item.update(
            { currentBid: amount, winnerId: userId, bidCount: item.bidCount + 1 },
            { where: { id: currentItemId }, transaction }
          );

          await Log.create(
            {
              action: "PLACE_BID",
              details: JSON.stringify({ userId, itemId: currentItemId, amount }),
            },
            { transaction }
          );

          await transaction.commit();

          io.emit("bid:placed", {
            amount,
            bidder: user.username,
            wallet: user.wallet - amount,
            timestamp: bid.createdAt,
          });

          await broadcastState();
        } catch (transactionErr) {
          await transaction.rollback();
          console.error("Bid transaction error:", transactionErr);
          socket.emit("bid:error", "Bid failed due to race condition. Try again.");
        }
      } catch (err) {
        console.error("Bid place error:", err);
        socket.emit("bid:error", "Bid failed. Please try again.");
      }
    });

    // Admin marks item as SOLD
    socket.on("admin:markSold", async ({ itemId, winnerId }) => {
      // Verify admin
      if (socket.userRole !== "admin") {
        socket.emit("error", { message: "Admin access required" });
        return;
      }

      // Validate input
      if (!itemId || typeof itemId !== "number") {
        socket.emit("error", { message: "Invalid item ID" });
        return;
      }

      try {
        const item = await Item.findByPk(itemId);
        if (!item) {
          socket.emit("error", { message: "Item not found" });
          return;
        }

        await Item.update(
          { status: "sold", isActive: false },
          { where: { id: itemId } }
        );

        await Log.create({
          action: "ITEM_SOLD",
          details: JSON.stringify({ itemId, winnerId, adminId: socket.userId }),
        });

        io.emit("auction:item:marked:sold", {
          itemId: item.id,
          itemName: item.name,
          winnerId,
          winningBid: item.currentBid,
        });
      } catch (err) {
        console.error("Mark sold error:", err);
        socket.emit("error", { message: "Failed to mark item as sold" });
      }
    });

    // Admin marks item as UNSOLD
    socket.on("admin:markUnsold", async ({ itemId }) => {
      // Verify admin
      if (socket.userRole !== "admin") {
        socket.emit("error", { message: "Admin access required" });
        return;
      }

      // Validate input
      if (!itemId || typeof itemId !== "number") {
        socket.emit("error", { message: "Invalid item ID" });
        return;
      }

      try {
        const item = await Item.findByPk(itemId);
        if (!item) {
          socket.emit("error", { message: "Item not found" });
          return;
        }

        // Refund all bids for this item
        const bids = await Bid.findAll({ where: { itemId } });
        for (const bid of bids) {
          const bidder = await User.findByPk(bid.bidderId);
          if (bidder) {
            await User.update(
              { wallet: bidder.wallet + bid.amount },
              { where: { id: bid.bidderId } }
            );
          }
        }

        // Reset the item for later auction
        await Item.update(
          {
            status: "unsold",
            isActive: false,
            currentBid: item.basePrice,
            winnerId: null,
            timerEnd: null,
            bidCount: 0,
          },
          { where: { id: itemId } }
        );

        // Clear bids for this item
        await Bid.destroy({ where: { itemId } });

        await Log.create({
          action: "ITEM_UNSOLD",
          details: JSON.stringify({ itemId, adminId: socket.userId }),
        });

        io.emit("auction:item:marked:unsold", {
          itemId: item.id,
          itemName: item.name,
        });
      } catch (err) {
        console.error("Mark unsold error:", err);
        socket.emit("error", { message: "Failed to mark item as unsold" });
      }
    });

    // ✅ Admin starts auction
    socket.on("admin:start", async () => {
      // Verify admin
      if (socket.userRole !== "admin") {
        socket.emit("error", { message: "Admin access required" });
        return;
      }

      try {
        const items = await getNextItems("all");

        if (items.length === 0) {
          io.emit("auction:end");
          return;
        }

        // Mark all items as active
        await Item.update(
          { isActive: true },
          { where: { status: "pending" } }
        );

        await startItemAuction(items[0].id);
      } catch (err) {
        console.error("Admin start error:", err);
        socket.emit("error", { message: "Failed to start auction" });
      }
    });

    // ✅ Admin moves to next item
    socket.on("admin:next", async () => {
      // Verify admin
      if (socket.userRole !== "admin") {
        socket.emit("error", { message: "Admin access required" });
        return;
      }

      try {
        if (timerInterval) clearInterval(timerInterval);

        const currentItems = await getNextItems("all");
        const currentIndex = currentItems.findIndex(i => i.id === currentItemId);

        let nextItem = null;

        // If current item not found (was marked unsold), find next item by auction index
        if (currentIndex === -1) {
          const currentItem = await Item.findByPk(currentItemId);
          if (currentItem) {
            nextItem = currentItems.find(i => i.auctionIndex > currentItem.auctionIndex) || null;
          } else {
            nextItem = currentItems.length > 0 ? currentItems[0] : null;
          }
        } else if (currentIndex >= 0 && currentIndex < currentItems.length - 1) {
          // Find next active item in the list
          nextItem = currentItems[currentIndex + 1];
        }

        if (!nextItem) {
          // No more active items, check for unsold items
          const unsoldsItems = await Item.findAll({
            where: { status: "unsold" },
            order: [["auctionIndex", "ASC"]],
          });

          if (unsoldsItems.length > 0) {
            io.emit("auction:unsold:items:available", {
              count: unsoldsItems.length,
              message: "Unsold items available. Click to start unsold items auction.",
            });
            return;
          } else {
            io.emit("auction:end");
            return;
          }
        }

        await startItemAuction(nextItem.id);
      } catch (err) {
        console.error("Admin next error:", err);
        socket.emit("error", { message: "Failed to move to next item" });
      }
    });

    // ✅ Admin starts unsold items auction
    socket.on("admin:start:unsold", async () => {
      // Verify admin
      if (socket.userRole !== "admin") {
        socket.emit("error", { message: "Admin access required" });
        return;
      }

      try {
        const unsoldsItems = await Item.findAll({
          where: { status: "unsold" },
          order: [["auctionIndex", "ASC"]],
        });

        if (unsoldsItems.length === 0) {
          io.emit("auction:end");
          return;
        }

        // Reset unsold items to active
        await Item.update(
          {
            status: "active",
            isActive: true,
            currentBid: sequelize.where(sequelize.col("basePrice"), ""),
          },
          { where: { status: "unsold" } }
        );

        // Properly reset currentBid
        for (const item of unsoldsItems) {
          await Item.update(
            { currentBid: item.basePrice },
            { where: { id: item.id } }
          );
        }

        await startItemAuction(unsoldsItems[0].id);
      } catch (err) {
        console.error("Admin start unsold error:", err);
        socket.emit("error", { message: "Failed to start unsold items auction" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
