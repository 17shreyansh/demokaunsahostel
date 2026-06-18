const express = require('express');
const HostelManager = require('../models/HostelManager');
const Hostel = require('../models/Hostel');
const HostelChangeRequest = require('../models/HostelChangeRequest');
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
    const Hostel = require('../models/Hostel');
    
    const manager = await HostelManager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.kyc.status !== 'submitted') {
      return res.status(400).json({ message: 'KYC must be in submitted state to approve' });
    }

    manager.kyc.status = 'verified';
    manager.kyc.verifiedAt = new Date();
    manager.kyc.rejectionReason = null;
    manager.kyc.rejectedAt = null;
    
    // Add to history
    if (!manager.kyc.history) manager.kyc.history = [];
    manager.kyc.history.push({
      status: 'verified',
      timestamp: new Date(),
      reason: 'KYC approved by admin',
      adminId: req.user.id
    });

    await manager.save();
    
    // Update all hostels owned by this manager to verified
    await Hostel.updateMany(
      { _id: { $in: manager.hostels } },
      { verified: true }
    );
    
    res.json({ message: 'KYC approved and hostels verified', manager, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject KYC
router.post('/managers/:id/kyc/reject', auth, adminOnly, async (req, res) => {
  try {
    const Hostel = require('../models/Hostel');
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const manager = await HostelManager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.kyc.status !== 'submitted') {
      return res.status(400).json({ message: 'KYC must be in submitted state to reject' });
    }

    manager.kyc.status = 'rejected';
    manager.kyc.rejectionReason = reason;
    manager.kyc.rejectedAt = new Date();
    manager.kyc.verifiedAt = null;
    
    // Add to history
    if (!manager.kyc.history) manager.kyc.history = [];
    manager.kyc.history.push({
      status: 'rejected',
      timestamp: new Date(),
      reason: reason,
      adminId: req.user.id
    });

    await manager.save();
    
    // Update all hostels owned by this manager to not verified
    await Hostel.updateMany(
      { _id: { $in: manager.hostels } },
      { verified: false }
    );
    
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

// Get all pending change requests
router.get('/change-requests/pending', auth, adminOnly, async (req, res) => {
  try {
    const requests = await HostelChangeRequest.find({ status: 'pending' })
      .populate('manager', 'name email businessName')
      .populate('hostel', 'name location images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all change requests (with filters)
router.get('/change-requests', auth, adminOnly, async (req, res) => {
  try {
    const { status, managerId, requestType } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (managerId) query.manager = managerId;
    if (requestType) query.requestType = requestType;
    
    const requests = await HostelChangeRequest.find(query)
      .populate('manager', 'name email businessName')
      .populate('hostel', 'name location images')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific change request
router.get('/change-requests/:id', auth, adminOnly, async (req, res) => {
  try {
    const request = await HostelChangeRequest.findById(req.params.id)
      .populate('manager', 'name email phone businessName')
      .populate('hostel')
      .populate('reviewedBy', 'username');
    
    if (!request) {
      return res.status(404).json({ message: 'Change request not found' });
    }
    
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve change request
router.post('/change-requests/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const request = await HostelChangeRequest.findById(req.params.id)
      .populate('manager', 'hostels');
    
    if (!request) {
      return res.status(404).json({ message: 'Change request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    
    let hostel;
    
    if (request.requestType === 'create') {
      // Create new hostel
      hostel = new Hostel(request.changeData);
      await hostel.save();
      
      // Add to manager's hostels
      await HostelManager.findByIdAndUpdate(request.manager._id, {
        $push: { hostels: hostel._id }
      });
      
      request.hostel = hostel._id;
    } else if (request.requestType === 'update') {
      // Update existing hostel
      hostel = await Hostel.findByIdAndUpdate(
        request.hostel,
        request.changeData,
        { new: true }
      );
      
      if (!hostel) {
        return res.status(404).json({ message: 'Hostel not found' });
      }
    }
    
    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Change request approved successfully',
      request,
      hostel
    });
  } catch (error) {
    console.error('Approve change request error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject change request
router.post('/change-requests/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const request = await HostelChangeRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Change request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    
    request.status = 'rejected';
    request.rejectionReason = reason;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Change request rejected',
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
