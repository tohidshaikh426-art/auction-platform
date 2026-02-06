require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/db");

// Initialize models after sequelize instance is available
const User = require("./models/User")(sequelize, require("sequelize").DataTypes);
const Item = require("./models/Item")(sequelize, require("sequelize").DataTypes);
const Bid = require("./models/bid")(sequelize, require("sequelize").DataTypes);
const Log = require("./models/log")(sequelize, require("sequelize").DataTypes);

const app = express();

// CORS configuration
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",") ||
  ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public")); // Serve images and static files

// Initialize associations
User.hasMany(Bid, { foreignKey: "bidderId" });
Bid.belongsTo(User, { foreignKey: "bidderId" });
Item.hasMany(Bid, { foreignKey: "itemId" });
Bid.belongsTo(Item, { foreignKey: "itemId" });

// Routes - Moved before database sync to avoid reference errors
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bidRoutes = require("./routes/bids");

// Routes
app.use("/api/auth", (req, res, next) => {
  req.models = { User, Item, Bid, Log };
  req.sequelize = sequelize;
  next();
}, authRoutes);
app.use("/api/admin", (req, res, next) => {
  req.models = { User, Item, Bid, Log };
  req.sequelize = sequelize;
  next();
}, adminRoutes);
app.use("/api/bids", (req, res, next) => {
  req.models = { User, Item, Bid, Log };
  req.sequelize = sequelize;
  next();
}, bidRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: process.env.DATABASE_URL ? "postgres" : "sqlite"
  });
});

// Sync DB and seed (run once, not on every request)
(async () => {
  try {
    await sequelize.sync({ force: false });
    
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
  } catch (error) {
    console.error("Database seeding error:", error);
  }
})();

// Handle serverless function for Vercel
const serverless = require("serverless-http");

// For local development
if (require.main === module) {
  const http = require("http");
  const { Server } = require("socket.io");
  
  const server = http.createServer(app);
  
  // CORS configuration for local
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
  
  // Initialize socket logic
  require("./sockets/auction")(io, Item, Bid, User, Log, sequelize);
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Auction server running on port ${PORT}`);
  });
} else {
  // For Vercel deployment - only API routes, no Socket.IO for now
  module.exports = serverless(app);
}
