const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Donation = sequelize.define('Donation', {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    customAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    donationType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
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
   
    tools: {
        type: DataTypes.STRING,
        allowNull: true,
    },
   
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
   
});

module.exports = Donation;
