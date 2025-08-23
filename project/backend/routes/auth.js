const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Set HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      admin: { id: admin._id, username: admin.username },
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin logout
router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully', success: true });
});

// Create admin (for initial setup)
router.post('/register', async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current admin profile
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({ admin, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Update password if provided
    if (currentPassword && newPassword) {
      if (!(await admin.comparePassword(currentPassword))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      admin.password = newPassword;
    }
    
    // Update username if provided
    if (username && username !== admin.username) {
      admin.username = username;
    }
    
    await admin.save();
    res.json({ message: 'Profile updated successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;