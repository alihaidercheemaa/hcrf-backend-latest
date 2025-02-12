const BadgeApplication = require('../models/BadgeApplication');

const submitBadgeApplication = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('Uploaded Files:', req.files); // Log the uploaded files

    // Destructure the incoming data from req.body
    const {
      businessName,
      contactPerson,
      emailAddress,
      phoneNumber,
      businessAddress,
      badges,
      businessDescription,
      productionMethods,
      documentation,
      otherDocumentation,
      certification,
    } = req.body;

    // Check if badges and documentation are JSON strings, and parse them if necessary
    const parsedBadges = badges && typeof badges === 'string' ? JSON.parse(badges) : badges;
    const parsedDocumentation = documentation && typeof documentation === 'string' ? JSON.parse(documentation) : documentation;

    // Handle uploaded files, extracting their paths
    const filePaths = req.files ? req.files.map((file) => file.path) : [];

    // Save the application data to the database
    const application = await BadgeApplication.create({
      businessName,
      contactPerson,
      emailAddress,
      phoneNumber,
      businessAddress,
      badges: parsedBadges, // Use parsed badges (if any)
      businessDescription,
      productionMethods,
      supportingDocumentation: parsedDocumentation, // Use parsed documentation (if any)
      otherDocumentation,
      certification,
      uploadedFiles: JSON.stringify(filePaths), // Store file paths as a JSON string
    });

    res.status(201).json({
      success: true,
      message: 'Badge application submitted successfully.',
      application,
    });
  } catch (error) {
    console.error('Error during application submission:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};




// Retrieve all badge applications
const getAllBadgeApplications = async (req, res) => {
  try {
    const applications = await BadgeApplication.findAll();
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Retrieve a single badge application by ID
const getBadgeApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await BadgeApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Update a badge application
const updateBadgeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      businessName,
      contactPerson,
      emailAddress,
      phoneNumber,
      businessAddress,
      badges,
      businessDescription,
      productionMethods,
      documentation,
      otherDocumentation,
      certification,
    } = req.body;

    const application = await BadgeApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const parsedBadges = typeof badges === 'string' ? JSON.parse(badges) : badges;
    const parsedDocumentation = typeof documentation === 'string' ? JSON.parse(documentation) : documentation;

    await application.update({
      businessName,
      contactPerson,
      emailAddress,
      phoneNumber,
      businessAddress,
      badges: parsedBadges,
      businessDescription,
      productionMethods,
      supportingDocumentation: parsedDocumentation,
      otherDocumentation,
      certification,
    });

    res.status(200).json({ success: true, message: 'Application updated successfully.', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Delete a badge application
const deleteBadgeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await BadgeApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    await application.destroy();
    res.status(200).json({ success: true, message: 'Application deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  submitBadgeApplication,
  getAllBadgeApplications,
  getBadgeApplicationById,
  updateBadgeApplication,
  deleteBadgeApplication,
};
