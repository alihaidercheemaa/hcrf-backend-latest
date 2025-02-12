const sequelize = require('./sequelize');
const User = require('../models/User');

(async () => {
    try {
        await sequelize.sync({ force: false }); // Use { force: true } to drop and recreate tables
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error syncing models:', error);
    }
})();
