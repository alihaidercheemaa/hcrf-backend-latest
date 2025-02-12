const express = require("express");
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} = require("../controllers/CampaignController");
const upload = require("../config/multerConfig"); // Multer config for image uploads
const { protect, admin } = require("../middleware/auth"); // Middleware for authentication

const router = express.Router();

// Create campaign (Admin only)
router.post("/", protect, admin, upload.array("images", 5), createCampaign);

// Get all campaigns
router.get("/", getAllCampaigns);

// Get single campaign by ID
router.get("/:id", getCampaignById);

// Update campaign (Admin only)
router.put("/:id", protect, admin, upload.array("images", 5), updateCampaign);

// Delete campaign (Admin only)
router.delete("/:id", protect, admin, deleteCampaign);

module.exports = router;
