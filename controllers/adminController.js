const User = require('../models/User');

// Controller function to get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
};

// Controller function to promote a user to admin
const promoteToAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId); // Use findByPk for primary key lookup
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isAdmin = true; // Set user as admin
        await user.save(); // Save the updated user
        res.status(200).json({ message: 'User promoted to admin successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllUsers,
    promoteToAdmin,
};
