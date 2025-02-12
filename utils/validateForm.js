// utils/validateForm.js
module.exports = (req, res, next) => {
    const { fullName, dob, gender, email, phone, nationality, membershipType, paymentMethod } = req.body;

    if (!fullName || !dob || !gender || !email || !phone || !nationality || !membershipType || !paymentMethod) {
        return res.status(400).json({ error: 'All required fields must be filled!' });
    }

    next();
};
