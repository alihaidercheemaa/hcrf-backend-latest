const ContactMessage = require('../models/ContactMessage');

const submitContactForm = async (req, res) => {
    const { name, email, message, phone } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !message) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    try {
        // Create a new contact message entry, setting phone and date if provided
        const newMessage = await ContactMessage.create({
            name,
            email,
            message,
            mobileNumber: phone || null, // Allow phone to be null if not provided
            date: new Date(), // Set current date if not provided
        });

        res.status(201).json(newMessage);  // Return the newly created message
    } catch (err) {
        console.error('Error saving message:', err); // Log error for debugging
        res.status(500).json({ error: 'Failed to save message' });
    }
};

const getMessages = async (req, res) => {
    try {
        console.log('Fetching messages for user:', req.user.id);  // Log user ID
        const messages = await ContactMessage.findAll();  // Retrieve all messages from the database

        if (!messages) {
            return res.status(404).json({ error: 'No messages found' });
        }

        res.json(messages);  // Return messages as JSON
    } catch (error) {
        console.error('Error fetching messages:', error);  // Log detailed error
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
module.exports = {
    submitContactForm,
    getMessages
};
