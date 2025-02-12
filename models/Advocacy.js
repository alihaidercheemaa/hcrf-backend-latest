// models/Advocacy.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Advocacy = sequelize.define(
  "Advocacy",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tagline: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hashtags: {
      type: DataTypes.JSON, // Store hashtags as an array of strings
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON, // Store multiple image paths as an array
      allowNull: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

Advocacy.sync({ alter: true })
  .then(() => console.log("Advocacy table synced successfully."))
  .catch((err) => console.error("Error syncing Advocacy table:", err));

module.exports = Advocacy;
