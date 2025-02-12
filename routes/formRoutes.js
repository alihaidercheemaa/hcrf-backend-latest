const express = require('express');
const router = express.Router();

const {
  createMember,
  getMemberDetails,
  updateMember,
  deleteMember,
  sendWelcomeEmail,
  getMembers,
  approveMembership,
  rejectMembership,
  getPendingMemberships,
  getMembershipByEmail,
  getAllMembers,
  getApprovedMembers,
  getRejectedMembers,
  checkMembership,
} = require('../controllers/formController');

const { protect, admin } = require('../middleware/auth');

// Public route for registration
router.post('/register', createMember);

// Admin routes for member management
router.get('/all', protect, admin, getAllMembers);
router.get('/approved',  getApprovedMembers);
router.get('/rejected', protect, admin, getRejectedMembers);
router.get('/', protect, admin, getMembers);
router.get('/pending', protect, admin, getPendingMemberships);
router.get('/:memberId', protect, admin, getMemberDetails);
router.put('/:memberId', protect, admin, updateMember);
router.delete('/:memberId', protect, admin, deleteMember);
router.post('/:memberId/welcome-email', protect, admin, sendWelcomeEmail);
router.post('/:memberId/approve', protect, admin, approveMembership);
router.post('/:memberId/reject', protect, admin, rejectMembership);
router.get('/checkMembership', checkMembership);
 
// Route for fetching membership by email
router.get('/membership/:email', getMembershipByEmail);

module.exports = router;
