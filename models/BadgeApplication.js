const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const BadgeApplication = sequelize.define(
  'BadgeApplication',
  {
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9+\-()\s]*$/, // Allows phone numbers with +, -, (, ), and spaces
      },
    },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    badges: {
      type: DataTypes.JSON, // Array of selected badges
      allowNull: true,
    },
    businessDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    productionMethods: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    supportingDocumentation: {
      type: DataTypes.JSON, // Array of selected documentation
      allowNull: true,
    },
    otherDocumentation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uploadedFiles: {
      type: DataTypes.JSON, // Array to store uploaded file paths
      allowNull: false,
    },
    certification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Synchronize the model with the database
BadgeApplication.sync({ alter: true })
  .then(() => console.log('BadgeApplication table synced successfully.'))
  .catch((err) => console.error('Error syncing BadgeApplication table:', err));

module.exports = BadgeApplication;
