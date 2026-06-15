const express = require('express');
const HostelManager = require('../models/HostelManager');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all hostel managers
router.get('/managers', auth, adminOnly, async (req, res) => {
  try {
    const managers = await HostelManager.find()
      .select('-password')
      .populate('hostels', 'name location')
      .sort('-createdAt');
    res.json({ managers, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending KYC submissions
router.get('/managers/kyc/pending', auth, adminOnly, async (req, res) => {
  try {
    const managers = await HostelManager.find({ 'kyc.status': 'submitted' })
      .select('-password')
      .sort('-kyc.submittedAt');
    res.json({ managers, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve KYC
router.post('/managers/:id/kyc/approve', auth, adminOnly, async (req, res) => {
  try {
    const manager = await HostelManager.findByIdAndUpdate(
      req.params.id,
      { 
        'kyc.status': 'verified',
        'kyc.verifiedAt': new Date()
      },
      { new: true }
    ).select('-password');
    
    res.json({ message: 'KYC approved', manager, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject KYC
router.post('/managers/:id/kyc/reject', auth, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const manager = await HostelManager.findByIdAndUpdate(
      req.params.id,
      { 
        'kyc.status': 'rejected',
        'kyc.rejectionReason': reason
      },
      { new: true }
    ).select('-password');
    
    res.json({ message: 'KYC rejected', manager, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle manager active status
router.patch('/managers/:id/toggle-status', auth, adminOnly, async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.params.id);
    manager.isActive = !manager.isActive;
    await manager.save();
    
    res.json({ message: 'Status updated', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
