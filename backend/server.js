require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { sequelize } = require("./config/db");
const User = require("./models/User")(sequelize, require("sequelize").DataTypes);
const Item = require("./models/Item")(sequelize, require("sequelize").DataTypes);
const Bid = require("./models/bid")(sequelize, require("sequelize").DataTypes);
const Log = require("./models/log")(sequelize, require("sequelize").DataTypes);

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bidRoutes = require("./routes/bids");

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",") ||
  ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public")); // Serve images and static files

// Associations
User.hasMany(Bid, { foreignKey: "bidderId" });
Bid.belongsTo(User, { foreignKey: "bidderId" });

Item.hasMany(Bid, { foreignKey: "itemId" });
Bid.belongsTo(Item, { foreignKey: "itemId" });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bids", bidRoutes);

// Sync DB and seed (run once, not on every request)
sequelize.sync({ force: false }).then(async () => {
  const adminExists = await User.findOne({ where: { role: "admin" } });
  if (!adminExists) {
    await User.create({
      username: "admin",
      password: "$2b$10$...", // hash this in real code
      role: "admin",
    });
  }

  const { itemImages, PRODUCT_ITEMS, TECH_ITEMS } = require("./utils/itemData");
  const allItems = [...PRODUCT_ITEMS, ...TECH_ITEMS];

  for (let i = 0; i < allItems.length; i++) {
    const itemName = allItems[i];
    const category = PRODUCT_ITEMS.includes(itemName) ? "product" : "technology";
    const imageName = itemImages[itemName];
    const imagePath = imageName ? `/images/${imageName}` : null;

    await Item.findOrCreate({
      where: { auctionIndex: i + 1 },
      defaults: {
        name: itemName,
        basePrice: 50,
        currentBid: 50,
        auctionIndex: i + 1,
        isActive: true,
        category,
        status: "pending",
        image: imagePath,
      },
    });
  }

  console.log("✅ 50 auction items seeded.");
});

// Socket.IO auction logic
require("./sockets/auction")(io, Item, Bid, User, Log, sequelize);

// ✅ Do NOT do this on Vercel:
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Auction server running on port ${PORT}`);
// });

// ✅ Export app/server so Vercel can handle it.
module.exports = { app, server };
