const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ 
      admin: { id: admin._id, username: admin.username },
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password, phone });
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ 
      user: { id: user._id, name: user.name, email: user.email },
      success: true 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully', success: true });
});

// Get current user/admin profile
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id).select('-password');
      return res.json({ user: admin, role: 'admin', success: true });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user, role: 'user', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (currentPassword && newPassword) {
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    res.json({ message: 'Profile updated successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update admin profile
router.put('/admin/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { username, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (currentPassword && newPassword) {
      if (!(await admin.comparePassword(currentPassword))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      admin.password = newPassword;
    }
    
    if (username) admin.username = username;
    
    await admin.save();
    res.json({ message: 'Profile updated successfully', success: true, admin: { username: admin.username } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create admin (protected - for initial setup only)
router.post('/admin/register', async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;