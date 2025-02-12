// models/PreOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PreOrder = sequelize.define('PreOrder', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  isMember: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  clickedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = PreOrder;
