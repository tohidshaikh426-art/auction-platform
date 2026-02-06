const { Sequelize } = require("sequelize");
const pg = require("pg"); // explicitly import pg

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
  // On Vercel: use Neon (PostgreSQL)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectModule: pg, // tell Sequelize to use pg directly
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
