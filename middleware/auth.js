const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Log the token for debugging
            console.log('Token received:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Use Sequelize's `findByPk` to find the user by their primary key (userId)
            const user = await User.findByPk(decoded.userId);

            if (!user) {
                console.log('User not found for decoded userId:', decoded.userId);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach the user object to the request (excluding password)
            req.user = { ...user.dataValues };  // Use dataValues to get the raw user data
            delete req.user.password;  // Exclude the password field

            next();
        } catch (error) {
            console.error(`Token verification failed: ${error}`);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No token provided in request');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };
