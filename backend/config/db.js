const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql", // or "postgres", depending on your DB
  logging: false,
});

module.exports = { sequelize };
