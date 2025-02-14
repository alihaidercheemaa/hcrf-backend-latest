const { sequelize } = require('../config/db');
const Donation = require('./Donation'); 
const Member = require('./Member');
const Certification = require('./Certification'); 

// Setup associations if needed

module.exports = {
  sequelize,
  Donation,
  Member,
  Certification, 
};