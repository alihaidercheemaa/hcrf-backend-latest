// controllers/LegislativeLobbyController.js
const LegislativeLobby = require("../models/LegislativeLobby");

// Get all legislative lobby members
exports.getAllLegislators = async (req, res) => {
  try {
    const legislators = await LegislativeLobby.findAll();
    res.json(legislators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single legislator by ID
exports.getLegislatorById = async (req, res) => {
  try {
    const legislator = await LegislativeLobby.findByPk(req.params.id);
    if (!legislator) return res.status(404).json({ error: "Legislator not found" });
    res.json(legislator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new legislator
exports.createLegislator = async (req, res) => {
  try {
    const { name, location, title, image, hoverImage } = req.body;
    const newLegislator = await LegislativeLobby.create({ name, location, title, image, hoverImage });
    res.status(201).json(newLegislator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a legislator by ID
exports.updateLegislator = async (req, res) => {
  try {
    const { name, location, title, image, hoverImage } = req.body;
    const legislator = await LegislativeLobby.findByPk(req.params.id);
    if (!legislator) return res.status(404).json({ error: "Legislator not found" });

    await legislator.update({ name, location, title, image, hoverImage });
    res.json(legislator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a legislator by ID
exports.deleteLegislator = async (req, res) => {
  try {
    const legislator = await LegislativeLobby.findByPk(req.params.id);
    if (!legislator) return res.status(404).json({ error: "Legislator not found" });

    await legislator.destroy();
    res.json({ message: "Legislator deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
