const Member = require("../models/Member");
const User = require('../models/User');
const sendEmail = require("../utils/sendEmail");

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      email,
      phone,
      country,
      nationality,
      state,
      city,
      postalCode,
      streetAddress,
      membershipType,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !dob ||
      !gender ||
      !email ||
      !phone ||
      !nationality ||
      !membershipType ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Validate payment method
    if (!["upi", "bankTransfer"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // New member data
    const newMemberData = {
      fullName,
      dob,
      gender,
      email,
      phone,
      country: country || null,
      nationality,
      state: state || null,
      city: city || null,
      postalCode: postalCode || null,
      streetAddress: streetAddress || null,
      membershipType,
      paymentMethod, 
      status: "pending",
    };

    // Save new member
    const newMember = await Member.create(newMemberData);

    // Success response
    res
      .status(201)
      .json({ message: "Member registered successfully!", data: newMember });
  } catch (error) {
    console.error("Error during member creation:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

// Get all members (Admin-only)
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.findAll();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

// Get details of a specific member
exports.getMemberDetails = async (req, res) => {
  const { memberId } = req.params;
  try {
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch member details" });
  }
};

// Update member details
exports.updateMember = async (req, res) => {
  const { memberId } = req.params;
  const updates = req.body;
  try {
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    await member.update(updates);
    res.status(200).json({ message: "Member updated successfully", member });
  } catch (error) {
    res.status(500).json({ error: "Failed to update member details" });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  const { memberId } = req.params;
  try {
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    await member.destroy();
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete member" });
  }
};

// Send a welcome email to a new member
exports.sendWelcomeEmail = async (req, res) => {
  const { memberId } = req.params;
  try {
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const subject = "Welcome to the Membership Program!";
    const message = `
            Dear ${member.fullName},
            Welcome to our membership program! We’re thrilled to have you with us.
            If you have any questions, feel free to reach out at any time.
            Best Regards,
            Your Team
        `;

    await sendEmail(member.email, subject, message);
    res.status(200).json({ message: "Welcome email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send welcome email" });
  }
};

// Approve a membership request
exports.approveMembership = async (req, res) => {
  const { memberId } = req.params;

  try {
      const member = await Member.findByPk(memberId);
      if (!member) {
          return res.status(404).json({ error: "Member not found" });
      }

      if (member.status !== "pending") {
          return res.status(400).json({ error: "Membership request is not pending" });
      }

      // Approve the membership
      member.status = "approved";
      await member.save();

      // Find or create a user based on the member's email
      const [user, created] = await User.findOrCreate({
          where: { email: member.email },
          defaults: {
              name: member.fullName,
              password: "default_password", // Set a default or generate a random password
              isMember: true,
          },
      });

      // If the user already exists, update the `isMember` field
      if (!created) {
          user.isMember = true;
          await user.save();
      }

      // Send approval email
      const subject = "Membership Approved";
      const message = `
          Dear ${member.fullName},
          Your membership request has been approved. Welcome aboard!
          Best Regards,
          The Team
      `;

      await sendEmail(member.email, subject, message);

      res.status(200).json({ message: "Membership approved successfully", member });
  } catch (error) {
      console.error("Error approving membership:", error);
      res.status(500).json({ error: "Failed to approve membership" });
  }
};

// Reject a membership request
exports.rejectMembership = async (req, res) => {
  const { memberId } = req.params;
  try {
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (member.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Membership request is not pending" });
    }

    member.status = "rejected";
    await member.save();

    const subject = "Membership Rejected";
    const message = `
            Dear ${member.fullName},
            We regret to inform you that your membership request has been rejected.
            Best Regards,
            The Team
        `;

    await sendEmail(member.email, subject, message);

    res
      .status(200)
      .json({ message: "Membership rejected successfully", member });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject membership" });
  }
};

// Fetch all pending memberships
exports.getPendingMemberships = async (req, res) => {
  try {
    const pendingMembers = await Member.findAll({
      where: { status: "pending" },
    });
    res.status(200).json(pendingMembers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending memberships" });
  }
};

// Get membership details by email
exports.getMembershipByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find membership by email
    const membership = await Member.findOne({ where: { email } });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.status(200).json(membership);
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Fetch all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll(); // Fetch all members
    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching all members:', error);
    res.status(500).json({ error: 'Failed to fetch all members' });
  }
};

// Fetch approved members
exports.getApprovedMembers = async (req, res) => {
  try {
    const approvedMembers = await Member.findAll({ where: { status: 'approved' } });
    res.status(200).json(approvedMembers);
  } catch (error) {
    console.error('Error fetching approved members:', error);
    res.status(500).json({ error: 'Failed to fetch approved members' });
  }
};

// Fetch rejected members
exports.getRejectedMembers = async (req, res) => {
  try {
    const rejectedMembers = await Member.findAll({ where: { status: 'rejected' } });
    res.status(200).json(rejectedMembers);
  } catch (error) {
    console.error('Error fetching rejected members:', error);
    res.status(500).json({ error: 'Failed to fetch rejected members' });
  }
};



// API to check if the user is a member and if their membership is approved
exports.checkMembership = async (req, res) => {
  try {
    const userId = req.user.id; 
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is a member and if their membership is approved
    const isMemberApproved = user.isMember && user.status === 'approved';

    res.status(200).json({ isMemberApproved });
  } catch (error) {
    console.error("Error checking membership:", error);
    res.status(500).json({ error: "Failed to check membership status" });
  }
};

