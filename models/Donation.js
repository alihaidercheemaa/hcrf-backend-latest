const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Donation = sequelize.define('Donation', {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    customAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    donationType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
        },
    },
    streetAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    tools: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    materials: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    enhancedWorkshop: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    craftInnovation: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    productPhotography: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    craftDocumentaries: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    craftResearch: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    employerName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    matchingGift: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

module.exports = Donation;
