const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Campaign = sequelize.define(
  "Campaign",
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

Campaign.sync({ alter: true })
  .then(() => console.log("Campaign table synced successfully."))
  .catch((err) => console.error("Error syncing Campaign table:", err));

module.exports = Campaign;
