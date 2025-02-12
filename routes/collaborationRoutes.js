const express = require('express');
const {
  submitCollaborationForm,
  getCollaborations,
  getPendingCollaborations,
  getApprovedCollaborations,
  getRejectedCollaborations,
  getCollaborationDetails,
  approveCollaboration,
  rejectCollaboration,
  deleteCollaboration,
} = require('../controllers/collaborationController');

const upload = require('../config/multerConfig'); // Multer for file uploads
const { protect, admin } = require('../middleware/auth'); // Middleware for protected routes
const router = express.Router();

// Public route for submitting collaboration forms
router.post('/submit', upload.single('supportingDocuments'), submitCollaborationForm);

// Admin-only routes for managing collaborations
router.get('/', protect, admin, getCollaborations); // Ensure getCollaborations is correctly imported
router.get('/pending', protect, admin, getPendingCollaborations);
router.get('/approved', protect, admin, getApprovedCollaborations); // Ensure getApprovedCollaborations is correctly imported
router.get('/rejected', protect, admin, getRejectedCollaborations); // Ensure getRejectedCollaborations is correctly imported
router.get('/:collaborationId', protect, admin, getCollaborationDetails); // Ensure getCollaborationDetails is correctly imported

// Collaboration approval and rejection
router.post('/:collaborationId/approve', protect, admin, approveCollaboration); 
router.post('/:collaborationId/reject', protect, admin, rejectCollaboration); 

// Delete collaboration
router.delete('/:collaborationId', protect, admin, deleteCollaboration); 

module.exports = router;
