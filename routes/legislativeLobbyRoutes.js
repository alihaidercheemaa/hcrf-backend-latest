// routes/legislativeLobbyRoutes.js
const express = require("express");
const router = express.Router();
const LegislativeLobbyController = require("../controllers/LegislativeLobbyController");

router.get("/", LegislativeLobbyController.getAllLegislators);
router.get("/:id", LegislativeLobbyController.getLegislatorById);
router.post("/", LegislativeLobbyController.createLegislator);
router.put("/:id", LegislativeLobbyController.updateLegislator);
router.delete("/:id", LegislativeLobbyController.deleteLegislator);

module.exports = router;
