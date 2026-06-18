const express = require('express');
const HostelManager = require('../models/HostelManager');
const Hostel = require('../models/Hostel');
const Review = require('../models/Review');
const HostelChangeRequest = require('../models/HostelChangeRequest');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: {
    fileSize: Infinity,
    fieldSize: Infinity,
    files: Infinity
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Middleware to check KYC status
const requireKYC = async (req, res, next) => {
  try {
    const manager = await HostelManager.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    if (manager.kyc.status !== 'verified') {
      return res.status(403).json({ 
        message: 'KYC verification required. Please complete your KYC to add/edit hostels.',
        kycStatus: manager.kyc.status
      });
    }
    if (!manager.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact admin.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id).populate('hostels');
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    
    const totalHostels = manager.hostels?.length || 0;
    const totalReviews = await Review.countDocuments({ hostel: { $in: manager.hostels || [] } });
    const avgRating = totalHostels > 0
      ? (manager.hostels.reduce((sum, h) => sum + (h.rating || 0), 0) / totalHostels)
      : 0;
    
    const pendingChanges = await HostelChangeRequest.countDocuments({ 
      manager: req.user.id, 
      status: 'pending' 
    });
    
    res.json({
      totalHostels,
      totalReviews,
      avgRating: avgRating.toFixed(1),
      kycStatus: manager.kyc?.status || 'pending',
      pendingChanges,
      success: true
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all hostels
router.get('/hostels', auth, async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id).populate('hostels');
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.json({ hostels: manager.hostels || [], success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add hostel - Create change request
router.post('/hostels', auth, upload.any(), async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id);
    const hostelData = { ...req.body };
    
    // Auto-verify hostel if manager's KYC is verified
    hostelData.verified = manager.kyc.status === 'verified';
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'sharingTypes', 'mapCoordinates', 'paymentDetails'].forEach(field => {
      if (hostelData[field] && typeof hostelData[field] === 'string') {
        try {
          hostelData[field] = JSON.parse(hostelData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });

    // Handle reservation settings
    if (hostelData.reservationEnabled !== undefined) {
      hostelData.reservationEnabled = hostelData.reservationEnabled === 'true' || hostelData.reservationEnabled === true;
    }
    if (hostelData.reservationAmount !== undefined) {
      const amount = Number(hostelData.reservationAmount);
      hostelData.reservationAmount = isNaN(amount) ? 0 : amount;
    }

    // Auto-compute base price from sharingTypes minimum
    if (hostelData.sharingTypes && hostelData.sharingTypes.length > 0) {
      const minPrice = Math.min(...hostelData.sharingTypes.map(s => Number(s.price) || 0));
      if (minPrice > 0) hostelData.price = minPrice;
    }
    
    // Handle contact info
    hostelData.contactInfo = {
      phone: hostelData.phone || '',
      address: hostelData.address || '',
      contactPersonName: hostelData.contactPersonName || '',
      jobTitle: hostelData.jobTitle || '',
      profileImage: null
    };
    
    // Clean up - remove individual fields from main data
    delete hostelData.phone;
    delete hostelData.address;
    delete hostelData.contactPersonName;
    delete hostelData.jobTitle;
    
    // Handle images - store just the filename
    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter(file => file.fieldname === 'images');
      hostelData.images = imageFiles.map(file => file.filename);
    }
    
    // Create change request for admin approval
    const changeRequest = new HostelChangeRequest({
      manager: req.user.id,
      requestType: 'create',
      changeData: hostelData,
      status: 'pending'
    });
    
    await changeRequest.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Hostel submitted for admin approval. You will be notified once approved.',
      changeRequest 
    });
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update hostel - Create change request
router.put('/hostels/:id', auth, upload.any(), async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id);
    if (!manager.hostels.includes(req.params.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const existingHostel = await Hostel.findById(req.params.id);
    if (!existingHostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    const updateData = { ...req.body };
    
    // Handle JSON fields
    ['amenities', 'rules', 'info', 'roomTypes', 'sharingTypes', 'mapCoordinates', 'paymentDetails'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          console.log(`Error parsing ${field}:`, e);
        }
      }
    });

    // Handle reservation settings
    if (updateData.reservationEnabled !== undefined) {
      updateData.reservationEnabled = updateData.reservationEnabled === 'true' || updateData.reservationEnabled === true;
    }
    if (updateData.reservationAmount !== undefined) {
      const amount = Number(updateData.reservationAmount);
      updateData.reservationAmount = isNaN(amount) ? 0 : amount;
    }

    // Auto-compute base price from sharingTypes minimum
    if (updateData.sharingTypes && updateData.sharingTypes.length > 0) {
      const minPrice = Math.min(...updateData.sharingTypes.map(s => Number(s.price) || 0));
      if (minPrice > 0) updateData.price = minPrice;
    }
    
    // Handle contact info
    updateData.contactInfo = {
      phone: updateData.phone || existingHostel?.contactInfo?.phone || '',
      address: updateData.address || existingHostel?.contactInfo?.address || '',
      contactPersonName: updateData.contactPersonName || existingHostel?.contactInfo?.contactPersonName || '',
      jobTitle: updateData.jobTitle || existingHostel?.contactInfo?.jobTitle || '',
      profileImage: existingHostel?.contactInfo?.profileImage || null
    };
    
    // Clean up - remove individual fields from main data
    delete updateData.phone;
    delete updateData.address;
    delete updateData.contactPersonName;
    delete updateData.jobTitle;
    
    // Handle images - keep existing and add new ones (store just filename)
    let finalImages = existingHostel?.images || [];
    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter(file => file.fieldname === 'images');
      const newImages = imageFiles.map(file => file.filename);
      finalImages = [...finalImages, ...newImages];
    }
    updateData.images = finalImages;
    
    // Create change request for admin approval
    const changeRequest = new HostelChangeRequest({
      manager: req.user.id,
      hostel: req.params.id,
      requestType: 'update',
      changeData: updateData,
      previousData: existingHostel,
      status: 'pending'
    });
    
    await changeRequest.save();
    
    res.json({ 
      success: true, 
      message: 'Changes submitted for admin approval. You will be notified once approved.',
      changeRequest 
    });
  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get change requests for manager
router.get('/change-requests', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { manager: req.user.id };
    if (status) query.status = status;
    
    const requests = await HostelChangeRequest.find(query)
      .populate('hostel', 'name location images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific change request details
router.get('/change-requests/:id', auth, async (req, res) => {
  try {
    const request = await HostelChangeRequest.findOne({
      _id: req.params.id,
      manager: req.user.id
    }).populate('hostel', 'name location')
      .populate('reviewedBy', 'username');
    
    if (!request) {
      return res.status(404).json({ message: 'Change request not found' });
    }
    
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete hostel
router.delete('/hostels/:id', auth, async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id);
    if (!manager.hostels.includes(req.params.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await Hostel.findByIdAndDelete(req.params.id);
    await HostelManager.findByIdAndUpdate(req.user.id, { $pull: { hostels: req.params.id } });
    
    res.json({ message: 'Hostel deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for manager's hostels
router.get('/reviews', auth, async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    
    const reviews = await Review.find({ hostel: { $in: manager.hostels || [] } })
      .populate('hostel', 'name')
      .populate('user', 'name email')
      .sort('-createdAt');
    
    res.json({ reviews: reviews || [], success: true });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
