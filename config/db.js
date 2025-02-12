require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "foundation12",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",  // ✅ Hardcoded for debugging
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

module.exports = { sequelize };
