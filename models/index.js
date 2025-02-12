// models/index.js
const { sequelize } = require('../config/db');
const Donation = require('./Donation'); 
const Member = require('./Member');

// Setup associations if needed

module.exports = {
  sequelize,
  Donation,
  Member
};