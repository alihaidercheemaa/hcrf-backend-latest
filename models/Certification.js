const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Certification = sequelize.define('Certification', {
    certType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    certName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amountPaid: {
        type: DataTypes.FLOAT,
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
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    razorpayPaymentId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
    },
});

module.exports = Certification;