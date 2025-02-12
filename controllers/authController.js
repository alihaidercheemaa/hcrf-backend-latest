const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Sequelize model
const sendEmail = require('../utils/sendEmail');

// Register user and send OTP for email verification
const register = async (req, res) => {
    const { name, email, password, isAdmin } = req.body;

    try {
        let user = await User.findOne({ where: { email } });

        if (user) {
            // If the user exists but hasn't verified OTP, update user details
            if (!user.verified) {
                user.name = name;
                user.password = await bcrypt.hash(password, 10); // Re-hash new password
                user.isAdmin = isAdmin;

                // Generate a new OTP and update OTP fields
                const otp = Math.floor(100000 + Math.random() * 900000);
                const otpExpiration = Date.now() + 3600000; // OTP expires in 1 hour

                user.otp = otp;
                user.otpExpiration = otpExpiration;

                await user.save();

                // Send OTP via email
                const subject = 'Verify your email';
                const text = `Your OTP for email verification is: ${otp}`;
                await sendEmail(email, subject, text);

                return res.status(200).json({ message: 'OTP has been resent. Please check your email for the new OTP.' });
            }

            return res.status(400).json({ message: 'User already exists and has been verified' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiration = Date.now() + 3600000; // OTP expires in 1 hour

        // Create a new user with OTP and expiration
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            isAdmin,
            verified: false,
            otp,
            otpExpiration
        });

        // Send OTP via email
        const subject = 'Verify your email';
        const text = `Your OTP for email verification is: ${otp}`;
        await sendEmail(email, subject, text);

        res.status(201).json({ message: 'User registered. Please check your email for the OTP.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP exists and if it has expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > user.otpExpiration) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // OTP is correct and valid
        user.verified = true; // Mark user as verified
        user.otp = undefined;  // Clear OTP
        user.otpExpiration = undefined;  // Clear OTP expiration time
        await user.save();

        // Generate JWT token with email included in the payload
        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: user.isAdmin },  // Include email here
            process.env.JWT_SECRET,  // Use environment variable for your secret key
            { expiresIn: '100h' }  // Token expiration time (can be adjusted)
        );

        res.status(200).json({ token, user, message: 'OTP verified and user logged in successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.verified) {
            return res.status(403).json({ message: 'Please verify your email to log in' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with email included in the payload
        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: user.isAdmin,
                isMember:user.isMember },  // Include email here
            process.env.JWT_SECRET,  // Use environment variable for your secret key
            { expiresIn: '100h' }  // Token expiration time (can be adjusted)
        );

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.userId);  // Changed findById to findByPk for Sequelize

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const newToken = jwt.sign(
            { userId: user.id, isAdmin: user.isAdmin },  // Changed _id to id for Sequelize
            process.env.JWT_SECRET,
            { expiresIn: '1000h' }
        );

        const newRefreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token
        const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create a reset link pointing to your resetPassword.html file
        const resetLink = `${process.env.DOMAIN}?token=${resetToken}`;
        const subject = 'Password Reset Request';
        const text = `You requested to reset your password. Please use the link below to set a new password:\n\n${resetLink}`;

        // Send the email with the reset link
        await sendEmail(email, subject, text);

        res.status(200).json({ message: 'Password reset email sent. Please check your email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Reset password - Verify token and update password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verify reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash and update the password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired.' });
        }
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    register,
    verifyOtp,
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
};
 