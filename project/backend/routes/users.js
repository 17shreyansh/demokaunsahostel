const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const UserHostelAssignment = require('../models/UserHostelAssignment');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get assignment counts for each user
    const userIds = users.map(u => u._id);
    const assignments = await UserHostelAssignment.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', hostels: { $push: '$hostel' } } }
    ]);

    const assignmentMap = {};
    assignments.forEach(a => {
      assignmentMap[a._id.toString()] = a.hostels;
    });

    users.forEach(user => {
      user.assignedHostels = assignmentMap[user._id.toString()] || [];
    });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalReviews
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single user
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const reviews = await Review.find({
      user: req.params.id
    })
      .populate('hostel', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      reviews
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Toggle user status
router.patch('/:id/toggle-status', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await Review.deleteMany({
      user: req.params.id
    });

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Assign hostels to user (bulk operation)
router.put('/:id/assign-hostels', auth, adminOnly, async (req, res) => {
  try {
    const { hostelIds } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove all existing assignments for this user
    await UserHostelAssignment.deleteMany({ user: userId });

    // Create new assignments
    if (hostelIds && hostelIds.length > 0) {
      const assignments = hostelIds.map(hostelId => ({
        user: userId,
        hostel: hostelId,
        assignedBy: req.user.id,
        canReview: true
      }));

      await UserHostelAssignment.insertMany(assignments);
    }

    res.json({
      success: true,
      message: `Successfully assigned ${hostelIds.length} hostel(s) to user`,
      assignedCount: hostelIds.length
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;