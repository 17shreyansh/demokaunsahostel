const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if not found to prevent email enumeration attacks
      return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.', success: true });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to database
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiration to 1 hour
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below to reset your password:\n\n ${resetUrl}\n\n This link will expire in 1 hour.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">Hello ${user.name},</p>
        <p style="color: #555; font-size: 16px;">You are receiving this email because you (or someone else) has requested a password reset for your KaunsaHostel account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #eab308; color: #111; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Reset Your Password</a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">This link will expire in 1 hour.</p>
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'KaunsaHostel - Password Reset Request',
        message,
        html,
      });

      res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.', success: true });
    } catch (err) {
      console.error('Error sending email:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      console.log('RESET URL (Fallback for local dev):', resetUrl);
      
      return res.status(500).json({ message: 'Email could not be sent. If you are running locally without SMTP, check the server console for the reset link.', success: false });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Hash token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user by token and check expiration
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token', success: false });
    }

    // Set new password (it will be hashed by the pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;