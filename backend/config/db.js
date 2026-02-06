const { Sequelize } = require("sequelize");

// If DATABASE_URL is set (e.g., on Vercel), use it; otherwise use SQLite
const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "mysql", // or "postgres" if you ever switch
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
  });
}

module.exports = { sequelize };
