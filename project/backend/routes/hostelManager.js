const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const HostelManager = require('../models/HostelManager');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const sendEmail = require('../utils/sendEmail');
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

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const manager = await HostelManager.findById(req.user.id);
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found', code: 'MANAGER_NOT_FOUND' });
    }

    if (name) manager.name = name;
    if (phone) manager.phone = phone;
    
    await manager.save();
    res.json({ message: 'Profile updated successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const manager = await HostelManager.findById(req.user.id);
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found', code: 'MANAGER_NOT_FOUND' });
    }

    const isMatch = await manager.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    manager.password = newPassword;
    await manager.save();
    
    res.json({ message: 'Password changed successfully', success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit KYC
router.post('/kyc', auth, upload.single('qrCode'), async (req, res) => {
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

    const { accountNumber, ifscCode, bankName, accountHolderName, upiId } = req.body;
    
    // Validate required fields
    if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
      return res.status(400).json({ message: 'All bank details are required' });
    }

    // Validate QR code file
    if (!req.file) {
      return res.status(400).json({ message: 'QR Code image is required' });
    }

    // Update KYC data
    manager.kyc = {
      status: 'submitted',
      bankDetails: { accountNumber, ifscCode, bankName, accountHolderName },
      paymentDetails: {
        upiId,
        qrCode: `/uploads/${req.file.filename}`
      },
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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const manager = await HostelManager.findOne({ email });

    if (!manager) {
      // Return 200 even if not found to prevent email enumeration attacks
      return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.', success: true });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to database
    manager.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiration to 1 hour
    manager.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    
    await manager.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hostel-manager/reset-password/${resetToken}`;
    
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below to reset your password:\n\n ${resetUrl}\n\n This link will expire in 1 hour.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">Hello ${manager.name},</p>
        <p style="color: #555; font-size: 16px;">You are receiving this email because you (or someone else) has requested a password reset for your KaunsaHostel Owner account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #eab308; color: #111; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Reset Your Password</a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">This link will expire in 1 hour.</p>
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: manager.email,
        subject: 'KaunsaHostel - Password Reset Request',
        message,
        html,
      });

      res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.', success: true });
    } catch (err) {
      console.error('Error sending email:', err);
      manager.resetPasswordToken = undefined;
      manager.resetPasswordExpires = undefined;
      await manager.save();
      
      // Still return 200 to prevent enumeration, or 500 if we want to show error
      // But we can log the resetUrl to terminal so the dev can test it locally without an email server
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

    // Find manager by token and check expiration
    const manager = await HostelManager.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!manager) {
      return res.status(400).json({ message: 'Invalid or expired password reset token', success: false });
    }

    // Set new password (it will be hashed by the pre-save hook)
    manager.password = password;
    manager.resetPasswordToken = undefined;
    manager.resetPasswordExpires = undefined;
    
    await manager.save();

    res.status(200).json({ message: 'Password has been reset successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
