const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const VisitBooking = require('../models/VisitBooking');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// Check if Razorpay credentials are configured
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('WARNING: Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
}

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

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

    // Paid booking - create Razorpay order
    if (!razorpay) {
      return res.status(500).json({ 
        success: false, 
        message: 'Razorpay not configured. Please contact admin to set up payment gateway.' 
      });
    }

    const options = {
      amount: 29900,
      currency: 'INR',
      receipt: `v_${Date.now().toString().slice(-8)}`,
      notes: {
        userId: req.user.id,
        hostelId: hostelId,
        hostelName: hostel.name
      }
    };

    const order = await razorpay.orders.create(options);

    const booking = new VisitBooking({
      user: req.user.id,
      hostel: hostelId,
      amount: 299,
      isFree: false,
      razorpayOrderId: order.id,
      paymentStatus: 'pending',
      visitStatus: 'pending'
    });

    await booking.save();

    res.json({
      success: true,
      isFree: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create booking order' });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      const booking = await VisitBooking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      booking.paymentStatus = 'completed';
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      booking.visitStatus = 'scheduled';
      await booking.save();

      res.json({ success: true, message: 'Payment verified successfully', booking });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await VisitBooking.find({ user: req.user.id })
      .populate('hostel', 'name images location')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
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
      .populate('user', 'name email phone')
      .populate('hostel', 'name location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await VisitBooking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update booking status
router.patch('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { visitStatus, visitDate, notes } = req.body;

    const booking = await VisitBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (visitStatus) booking.visitStatus = visitStatus;
    if (visitDate) booking.visitDate = visitDate;
    if (notes) booking.notes = notes;

    await booking.save();

    res.json({ success: true, message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
