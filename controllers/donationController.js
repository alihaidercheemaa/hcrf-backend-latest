const Donation = require('../models/Donation');

// Create a new donation entry
exports.createDonation = async (req, res) => {
    const {
        amount,
        customAmount,
        donationType,
        firstName,
        lastName,
        email,
        phone,
        streetAddress,
        city,
        state,
        zip,
        country,
        tools,
        paymentMethod,
        upiId,
    } = req.body;

    try {
        const donation = await Donation.create({
            amount,
            customAmount,
            donationType,
            firstName,
            lastName,
            email,
            phone,
            streetAddress,
            city,
            state,
            zip,
            country,
            tools: tools || null, // Assuming tools is an array or string
            paymentMethod,
            upiId: paymentMethod === 'upi' ? upiId : null,
        });

        res.status(201).json({
            success: true,
            message: 'Donation recorded successfully!',
            data: donation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to record donation',
            error: error.message,
        });
    }
};

// Get all donations
exports.getDonations = async (req, res) => {
    try {
        const donations = await Donation.findAll();
        res.status(200).json({
            success: true,
            data: donations,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donations',
            error: error.message,
        });
    }
};

// Get details of a specific donation
exports.getDonationDetails = async (req, res) => {
    const { donationId } = req.params;
    try {
        const donation = await Donation.findByPk(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found',
            });
        }
        res.status(200).json({
            success: true,
            data: donation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donation details',
            error: error.message,
        });
    }
};

// Delete a donation
exports.deleteDonation = async (req, res) => {
    const { donationId } = req.params;
    try {
        const donation = await Donation.findByPk(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found',
            });
        }
        await donation.destroy();
        res.status(200).json({
            success: true,
            message: 'Donation deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete donation',
            error: error.message,
        });
    }
};
