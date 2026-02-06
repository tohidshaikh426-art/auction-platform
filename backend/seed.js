const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/db");
const User = require("./models/User")(sequelize, require("sequelize").DataTypes);

const ADMIN_CREDENTIAL = "ITCS Committee"; // Confidential

const seedDatabase = async () => {
  try {
    await sequelize.sync();

    // Check if admin already exists
    const adminExists = await User.findOne({ where: { role: "admin" } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin_internal_secret", 10);
      
      await User.create({
        username: ADMIN_CREDENTIAL,
        password: hashedPassword,
        role: "admin",
        wallet: 100000,
      });

      console.log("✅ Admin user created");
      console.log(`   📌 Confidential credential: "${ADMIN_CREDENTIAL}"`);
      console.log("   ⚠️  Keep this confidential!");
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("\n✅ Database seeded successfully");
    console.log("\n📋 **Test Accounts:**");
    console.log("   🔐 Admin: Use credential 'ITCS Committee'");
    console.log("   👤 Bidders: Enter any CC name/code to auto-create account");
    console.log("      Example: 'John', 'CC-001', 'House A', etc.");
    
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedDatabase();
