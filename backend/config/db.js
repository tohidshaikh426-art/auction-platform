const { Sequelize } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || "development";
const VERCEL = process.env.VERCEL || false;

let sequelize;

// Try to dynamically require the pg package if needed
if (DATABASE_URL && (NODE_ENV === "production" || VERCEL)) {
  // On Vercel: use Supabase (PostgreSQL)
  try {
    const pg = require("pg");
    sequelize = new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      dialectModule: pg,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } catch (error) {
    console.error("Failed to initialize PostgreSQL connection:", error.message);
    throw error;
  }
} else {
  // Locally: use SQLite
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
  });
}

module.exports = { sequelize };
