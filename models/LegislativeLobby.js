// models/LegislativeLobby.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const LegislativeLobby = sequelize.define("LegislativeLobby", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING, // Store image URLs
    allowNull: false,
  },
  hoverImage: {
    type: DataTypes.STRING, // Store hover image URLs
    allowNull: true,
  },
});

module.exports = LegislativeLobby;
