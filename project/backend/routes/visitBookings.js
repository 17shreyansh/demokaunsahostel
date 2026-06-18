const express = require('express');
const VisitBooking = require('../models/VisitBooking');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// NOTE: Razorpay is disabled. Manual payment system is active.
// To re-enable Razorpay, set RAZORPAY_ENABLED=true in .env and restore the payment flow.

// Check free visit eligibility
router.get('/check-eligibility', auth, async (req, res) => {
  try {
    const completedCount = await VisitBooking.countDocuments({
      user: req.user.id,
      paymentStatus: 'completed'
    });

    const isFree = completedCount < 3;
    const remainingFree = isFree ? 3 - completedCount : 0;

    res.json({
      success: true,
      isFree,
      completedVisits: completedCount,
      remainingFreeVisits: remainingFree,
      nextVisitAmount: isFree ? 0 : 299
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create visit booking order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { hostelId } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Count completed bookings for user
    const completedCount = await VisitBooking.countDocuments({
      user: req.user.id,
      paymentStatus: 'completed'
    });

    // First 3 bookings are free
    const isFree = completedCount < 3;
    const amount = isFree ? 0 : 299;

    if (isFree) {
      // Create free booking directly
      const booking = new VisitBooking({
        user: req.user.id,
        hostel: hostelId,
        amount: 0,
        isFree: true,
        paymentStatus: 'completed',
        visitStatus: 'scheduled'
      });

      await booking.save();

      return res.json({
        success: true,
        isFree: true,
        bookingId: booking._id,
        message: `Free visit booking confirmed! You have ${3 - completedCount - 1} free visits remaining.`
      });
    }

    // Paid booking - use manual payment
    const booking = new VisitBooking({
      user: req.user.id,
      hostel: hostelId,
      amount: 299,
      isFree: false,
      paymentStatus: 'pending',
      visitStatus: 'pending'
    });

    await booking.save();

    // Get payment details - hostel first, then admin fallback
    let paymentDetails = hostel.paymentDetails;
    
    // If hostel doesn't have payment details, use admin defaults
    if (!paymentDetails || !paymentDetails.upiId) {
      const Settings = require('../models/Settings');
      const [upiSetting, qrSetting, instructionsSetting] = await Promise.all([
        Settings.findOne({ key: 'admin_upi_id' }),
        Settings.findOne({ key: 'admin_qr_code' }),
        Settings.findOne({ key: 'admin_payment_instructions' })
      ]);

      paymentDetails = {
        upiId: upiSetting?.value || 'Not configured',
        qrCode: qrSetting?.value || null,
        paymentInstructions: instructionsSetting?.value || 'Please contact admin for payment details'
      };
    }

    // Return manual payment details
    res.json({
      success: true,
      isFree: false,
      manualPayment: true,
      bookingId: booking._id,
      amount: 299,
      paymentDetails
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create booking order' });
  }
});

// Verify payment - DISABLED (Razorpay removed, manual payment system active)
// router.post('/verify-payment', ...) -- preserved for future re-enable

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await VisitBooking.find({ user: req.user.id })
      .populate({
        path: 'hostel',
        select: 'name images location',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out bookings where hostel no longer exists
    const validBookings = bookings.filter(booking => booking.hostel);

    res.json({ success: true, bookings: validBookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all bookings
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.paymentStatus = status;

    const bookings = await VisitBooking.find(query)
      .populate({
        path: 'user',
        select: 'name email phone',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'hostel',
        select: 'name location',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Filter out bookings where user or hostel no longer exists
    const validBookings = bookings.filter(booking => booking.user && booking.hostel);

    const total = await VisitBooking.countDocuments(query);

    res.json({
      success: true,
      bookings: validBookings,
      total: validBookings.length,
      totalPages: Math.ceil(validBookings.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Admin get bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update booking status
router.patch('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { visitStatus, visitDate, notes } = req.body;

    const booking = await VisitBooking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('hostel', 'name location');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.user) {
      return res.status(400).json({ success: false, message: 'Associated user no longer exists' });
    }

    if (!booking.hostel) {
      return res.status(400).json({ success: false, message: 'Associated hostel no longer exists' });
    }

    if (visitStatus) booking.visitStatus = visitStatus;
    if (visitDate) booking.visitDate = visitDate;
    if (notes) booking.notes = notes;

    await booking.save();

    res.json({ success: true, message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
