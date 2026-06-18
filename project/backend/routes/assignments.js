const express = require('express');
const UserHostelAssignment = require('../models/UserHostelAssignment');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// Admin: Assign user to hostel
router.post('/assign', auth, adminOnly, async (req, res) => {
  try {
    const { userId, hostelId, notes, selectedSharingType, useHostelPayment } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const existingAssignment = await UserHostelAssignment.findOne({ user: userId, hostel: hostelId });
    if (existingAssignment) {
      return res.status(400).json({ success: false, message: 'User already assigned to this hostel' });
    }

    const assignment = new UserHostelAssignment({
      user: userId,
      hostel: hostelId,
      assignedBy: req.user.id,
      notes,
      selectedSharingType,
      useHostelPayment: useHostelPayment === true || useHostelPayment === 'true'
    });

    await assignment.save();

    res.json({ success: true, message: 'User assigned to hostel successfully', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all assignments
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, hostelId } = req.query;

    const query = {};
    if (userId) query.user = userId;
    if (hostelId) query.hostel = hostelId;

    const assignments = await UserHostelAssignment.find(query)
      .populate('user', 'name email phone')
      .populate('hostel', 'name location')
      .populate('assignedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserHostelAssignment.countDocuments(query);

    res.json({
      success: true,
      assignments,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User: Get assigned hostels with installment plans
router.get('/my-assignments', auth, async (req, res) => {
  try {
    const assignments = await UserHostelAssignment.find({ user: req.user.id })
      .populate('hostel', 'name images location rating price installmentPlans paymentDetails')
      .sort({ createdAt: -1 });

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User: Get payment details for assignment
router.get('/assignment/:id/payment-info', auth, async (req, res) => {
  try {
    const assignment = await UserHostelAssignment.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('hostel', 'name paymentDetails');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Get admin payment settings if not using hostel payment
    let paymentInfo = null;
    
    if (assignment.useHostelPayment) {
      // Use hostel owner's payment details
      paymentInfo = {
        useHostelPayment: true,
        upiId: assignment.hostel.paymentDetails?.upiId,
        qrCode: assignment.hostel.paymentDetails?.qrCode,
        instructions: assignment.hostel.paymentDetails?.paymentInstructions
      };
    } else {
      // Use admin payment details
      const Settings = require('../models/Settings');
      const settings = await Settings.findOne();
      paymentInfo = {
        useHostelPayment: false,
        upiId: settings?.adminPayment?.upiId,
        qrCode: settings?.adminPayment?.qrCode,
        instructions: settings?.adminPayment?.instructions || 'Please pay to admin UPI and upload screenshot'
      };
    }

    res.json({ 
      success: true, 
      paymentInfo,
      assignment: {
        _id: assignment._id,
        hostelName: assignment.hostel.name,
        selectedSharingType: assignment.selectedSharingType,
        useHostelPayment: assignment.useHostelPayment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User: Select installment plan
router.post('/select-installment-plan', auth, async (req, res) => {
  try {
    const { assignmentId, installmentPlanId } = req.body;

    const assignment = await UserHostelAssignment.findOne({
      _id: assignmentId,
      user: req.user.id
    }).populate('hostel');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const plan = assignment.hostel.installmentPlans.id(installmentPlanId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Installment plan not found' });
    }

    assignment.selectedInstallmentPlan = installmentPlanId;
    assignment.installmentPayments = plan.installments.map((inst, index) => ({
      installmentIndex: index,
      amount: plan.type === 'percentage' ? (assignment.hostel.price * inst.value / 100) : inst.value,
      paid: false
    }));

    await assignment.save();

    res.json({ success: true, message: 'Installment plan selected', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Remove assignment
router.delete('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const assignment = await UserHostelAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await assignment.deleteOne();

    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users (for assignment dropdown)
router.get('/users/all', auth, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'user', isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('name email phone')
      .sort({ name: 1 })
      .limit(50);
    
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get admin payment settings
router.get('/admin-payment-settings', auth, adminOnly, async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    
    res.json({ 
      success: true, 
      adminPayment: settings?.adminPayment || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update admin payment settings
router.put('/admin-payment-settings', auth, adminOnly, async (req, res) => {
  try {
    const { upiId, qrCode, instructions } = req.body;
    const Settings = require('../models/Settings');
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.adminPayment = {
      upiId,
      qrCode,
      instructions
    };
    
    await settings.save();
    
    res.json({ 
      success: true, 
      message: 'Admin payment settings updated',
      adminPayment: settings.adminPayment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user can review a hostel
router.get('/can-review/:hostelId', auth, async (req, res) => {
  try {
    const assignment = await UserHostelAssignment.findOne({
      user: req.user.id,
      hostel: req.params.hostelId,
      canReview: true
    });

    res.json({ success: true, canReview: !!assignment, hasReviewed: assignment?.hasReviewed || false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
