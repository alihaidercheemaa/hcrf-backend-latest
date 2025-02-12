const Campaign = require("../models/Campaign");

// Create a new campaign
const createCampaign = async (req, res) => {
  try {
    const { title, tagline, description, hashtags } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    const campaign = await Campaign.create({
      title,
      tagline,
      description,
      hashtags: JSON.parse(hashtags), // Convert JSON string to array
      images,
    });

    res.status(201).json({ success: true, message: "Campaign created successfully.", campaign });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Retrieve all campaigns
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll();
    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Retrieve a single campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Update a campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tagline, description, hashtags } = req.body;

    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    const images = req.files ? req.files.map((file) => file.path) : campaign.images;

    await campaign.update({
      title,
      tagline,
      description,
      hashtags: JSON.parse(hashtags),
      images,
    });

    res.status(200).json({ success: true, message: "Campaign updated successfully.", campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Delete a campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found." });
    }

    await campaign.destroy();
    res.status(200).json({ success: true, message: "Campaign deleted successfully." });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
