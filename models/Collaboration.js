const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Collaboration = sequelize.define('Collaboration', {
  orgName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  collaborationAreas: {
    type: DataTypes.JSON, // Array of selected collaboration areas
    allowNull: true,
  },
  otherArea: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expectedOutcomes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  collaborationType: {
    type: DataTypes.JSON, // Array of selected collaboration types
    allowNull: true,
  },
  otherCollaboration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  supportingDocuments: {
    type: DataTypes.STRING, // File path for uploaded documents
    allowNull: true,
  },
  agreeTerms: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  futureComm: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending', // Default status is 'pending'
  },
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt`
});

module.exports = Collaboration;
