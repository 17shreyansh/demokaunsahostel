const express = require('express');
const UserHostelAssignment = require('../models/UserHostelAssignment');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all hostels with available info (for assignment)
router.get('/hostels-for-assignment', auth, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { verified: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const hostels = await Hostel.find(query)
      .select('name location sharingTypes price images availableBeds')
      .sort({ name: 1 })
      .limit(100);
    
    res.json({ success: true, hostels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get hostel details with sharing types
router.get('/hostel/:id/details', auth, adminOnly, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)
      .select('name location sharingTypes price images availableBeds installmentPlans');
    
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }
    
    // Get current assignments count
    const assignmentsCount = await UserHostelAssignment.countDocuments({ hostel: req.params.id });
    
    res.json({ success: true, hostel, assignmentsCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk assign users to hostel
router.post('/bulk-assign', auth, adminOnly, async (req, res) => {
  try {
    const { userIds, hostelId, notes, selectedSharingType, useHostelPayment } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs are required' });
    }
    
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }
    
    const results = {
      success: [],
      failed: [],
      alreadyAssigned: []
    };
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          results.failed.push({ userId, reason: 'User not found' });
          continue;
        }
        
        const existing = await UserHostelAssignment.findOne({ user: userId, hostel: hostelId });
        if (existing) {
          results.alreadyAssigned.push({ userId, userName: user.name });
          continue;
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
        results.success.push({ userId, userName: user.name });
      } catch (error) {
        results.failed.push({ userId, reason: error.message });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Assigned ${results.success.length} users successfully`,
      results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update assignment
router.put('/assignment/:id', auth, adminOnly, async (req, res) => {
  try {
    const { notes, selectedSharingType, canReview } = req.body;
    
    const assignment = await UserHostelAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    if (notes !== undefined) assignment.notes = notes;
    if (selectedSharingType !== undefined) assignment.selectedSharingType = selectedSharingType;
    if (canReview !== undefined) assignment.canReview = canReview;
    
    await assignment.save();
    
    res.json({ success: true, message: 'Assignment updated successfully', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assignment statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalAssignments = await UserHostelAssignment.countDocuments();
    const activeHostels = await UserHostelAssignment.distinct('hostel');
    const assignedUsers = await UserHostelAssignment.distinct('user');
    
    const topHostels = await UserHostelAssignment.aggregate([
      {
        $group: {
          _id: '$hostel',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'hostels',
          localField: '_id',
          foreignField: '_id',
          as: 'hostelInfo'
        }
      },
      { $unwind: '$hostelInfo' },
      {
        $project: {
          name: '$hostelInfo.name',
          location: '$hostelInfo.location',
          count: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalAssignments,
        activeHostelsCount: activeHostels.length,
        assignedUsersCount: assignedUsers.length,
        topHostels
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
