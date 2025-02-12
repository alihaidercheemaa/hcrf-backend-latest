// models/Member.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Member = sequelize.define('Member', {
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    postalCode: {
        type: DataTypes.STRING,
    },
    streetAddress: {
        type: DataTypes.STRING,
    },
    membershipType: {
        type: DataTypes.ENUM(
            'artisan',
            'individual',
            'professional',
            'corporate',
            'patron',
            'student'
        ),
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.ENUM('upi', 'bankTransfer', 'razorpay'),
        allowNull: false,
    },


    razorpayOrderId: {
        type: DataTypes.STRING,
        unique: true
      },
      razorpayPaymentId: {
        type: DataTypes.STRING,
        unique: true
      },      
    
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    timestamps: true,
});

module.exports = Member;
