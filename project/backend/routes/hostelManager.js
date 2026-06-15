const express = require('express');
const jwt = require('jsonwebtoken');
const HostelManager = require('../models/HostelManager');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const existing = await HostelManager.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const manager = new HostelManager({ name, email, phone, password });
    await manager.save();
    
    const token = jwt.sign({ id: manager._id, role: 'hostel-manager' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('manager_token', token, COOKIE_OPTIONS);
    res.status(201).json({ 
      manager: { id: manager._id, name: manager.name, email: manager.email, kycStatus: manager.kyc.status },
      success: true 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const manager = await HostelManager.findOne({ email });
    
    if (!manager || !(await manager.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!manager.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const token = jwt.sign({ id: manager._id, role: 'hostel-manager' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('manager_token', token, COOKIE_OPTIONS);
    res.json({ 
      manager: { id: manager._id, name: manager.name, email: manager.email, kycStatus: manager.kyc.status },
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('manager_token');
  res.json({ message: 'Logged out successfully', success: true });
});

// Get profile
router.get('/me', auth, async (req, res) => {
  try {
    const manager = await HostelManager.findById(req.user.id).select('-password');
    res.json({ manager, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit KYC
router.post('/kyc', auth, upload.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('KYC submission attempt - User ID from token:', req.user.id);
    
    const manager = await HostelManager.findById(req.user.id);
    
    if (!manager) {
      console.error('KYC Error: Manager not found for ID:', req.user.id);
      console.error('This usually means the authentication token is outdated or invalid');
      return res.status(404).json({ 
        message: 'Manager not found. Please logout and login again to refresh your session.',
        code: 'MANAGER_NOT_FOUND'
      });
    }

    console.log('Manager found:', manager.name, manager.email);

    // Check if KYC is already submitted or verified
    if (manager.kyc.status === 'submitted') {
      return res.status(400).json({ message: 'KYC is already submitted and under review' });
    }
    if (manager.kyc.status === 'verified') {
      return res.status(400).json({ message: 'KYC is already verified' });
    }

    const { companyName, companyType, gstNumber, accountNumber, ifscCode, bankName, accountHolderName } = req.body;
    
    // Validate required fields
    if (!companyName || !companyType || !gstNumber || !accountNumber || !ifscCode || !bankName || !accountHolderName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate files
    if (!req.files?.panCard || !req.files?.bankProof) {
      return res.status(400).json({ message: 'PAN Card and Bank Proof documents are required' });
    }

    // Update KYC data
    manager.kyc = {
      status: 'submitted',
      companyDetails: { companyName, companyType, gstNumber },
      documents: {
        panCard: `/uploads/${req.files.panCard[0].filename}`,
        bankProof: `/uploads/${req.files.bankProof[0].filename}`
      },
      bankDetails: { accountNumber, ifscCode, bankName, accountHolderName },
      submittedAt: new Date(),
      verifiedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      history: manager.kyc.history || []
    };
    
    // Add to history
    manager.kyc.history.push({
      status: 'submitted',
      timestamp: new Date(),
      reason: 'KYC submitted for review'
    });
    
    await manager.save();
    console.log('✅ KYC submitted successfully for manager:', manager._id);
    res.json({ message: 'KYC submitted successfully', success: true });
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
