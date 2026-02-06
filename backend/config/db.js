const { Sequelize } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
  // On Vercel: use Neon (PostgreSQL)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: false,
  });
} else {
  // Locally: use SQLite
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
  });
}

module.exports = { sequelize };
