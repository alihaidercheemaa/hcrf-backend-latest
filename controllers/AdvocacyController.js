// controllers/AdvocacyController.js
const Advocacy = require("../models/Advocacy");

// Create a new advocacy entry
const createAdvocacy = async (req, res) => {
  try {
    const { title, tagline, description, hashtags } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    const advocacy = await Advocacy.create({
      title,
      tagline,
      description,
      hashtags: JSON.parse(hashtags), // Convert JSON string to array
      images,
    });

    res.status(201).json({ success: true, message: "Advocacy created successfully.", advocacy });
  } catch (error) {
    console.error("Error creating advocacy:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Retrieve all advocacy entries
const getAllAdvocacy = async (req, res) => {
  try {
    const advocacies = await Advocacy.findAll();
    res.status(200).json({ success: true, advocacies });
  } catch (error) {
    console.error("Error fetching advocacies:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Retrieve a single advocacy entry by ID
const getAdvocacyById = async (req, res) => {
  try {
    const { id } = req.params;
    const advocacy = await Advocacy.findByPk(id);

    if (!advocacy) {
      return res.status(404).json({ success: false, message: "Advocacy not found." });
    }

    res.status(200).json({ success: true, advocacy });
  } catch (error) {
    console.error("Error fetching advocacy:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Update an advocacy entry
const updateAdvocacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tagline, description, hashtags } = req.body;

    const advocacy = await Advocacy.findByPk(id);
    if (!advocacy) {
      return res.status(404).json({ success: false, message: "Advocacy not found." });
    }

    const images = req.files ? req.files.map((file) => file.path) : advocacy.images;

    await advocacy.update({
      title,
      tagline,
      description,
      hashtags: JSON.parse(hashtags), // Convert JSON string to array
      images,
    });

    res.status(200).json({ success: true, message: "Advocacy updated successfully.", advocacy });
  } catch (error) {
    console.error("Error updating advocacy:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Delete an advocacy entry
const deleteAdvocacy = async (req, res) => {
  try {
    const { id } = req.params;
    const advocacy = await Advocacy.findByPk(id);

    if (!advocacy) {
      return res.status(404).json({ success: false, message: "Advocacy not found." });
    }

    await advocacy.destroy();
    res.status(200).json({ success: true, message: "Advocacy deleted successfully." });
  } catch (error) {
    console.error("Error deleting advocacy:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

module.exports = {
  createAdvocacy,
  getAllAdvocacy,
  getAdvocacyById,
  updateAdvocacy,
  deleteAdvocacy,
};
