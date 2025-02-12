// C:\Users\hasnain haider shah\Desktop\learn1\backend\middleware\validateObjectId.js

const mongoose = require('mongoose');

const validateObjectIdMiddleware = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Object ID' });
    }
    next();
};

module.exports = validateObjectIdMiddleware;