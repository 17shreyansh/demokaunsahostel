const express = require('express');
const PaymentRequest = require('../models/PaymentRequest');
const SeatReservation = require('../models/SeatReservation');
const VisitBooking = require('../models/VisitBooking');
const HostelManager = require('../models/HostelManager');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to verify manager owns the hostel
const verifyHostelOwnership = async (req, res, next) => {
  try {
    const manager = await HostelManager.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }
    req.manager = manager;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all payment requests for manager's hostels
router.get('/payment-requests', auth, verifyHostelOwnership, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const query = { hostel: { $in: req.manager.hostels } };
    if (status) query.status = status;
    if (type) query.paymentType = type;

    const requests = await PaymentRequest.find(query)
      .populate('user', 'name email phone')
      .populate('hostel', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve payment request
router.patch('/payment-requests/:id/approve', auth, verifyHostelOwnership, async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findById(req.params.id);
    
    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    // Verify manager owns the hostel
    if (!req.manager.hostels.includes(paymentRequest.hostel.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    paymentRequest.status = 'approved';
    paymentRequest.reviewedBy = req.user.id;
    paymentRequest.reviewedAt = new Date();
    await paymentRequest.save();

    // Update related booking/reservation
    if (paymentRequest.paymentType === 'visit' && paymentRequest.relatedBooking) {
      const booking = await VisitBooking.findById(paymentRequest.relatedBooking);
      if (booking) {
        booking.paymentStatus = 'completed';
        booking.visitStatus = 'scheduled';
        await booking.save();
      }
    } else if (paymentRequest.paymentType === 'reservation' && paymentRequest.relatedReservation) {
      const reservation = await SeatReservation.findById(paymentRequest.relatedReservation);
      if (reservation) {
        reservation.status = 'confirmed';
        await reservation.save();
      }
    }

    res.json({ success: true, message: 'Payment approved successfully', paymentRequest });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject payment request
router.patch('/payment-requests/:id/reject', auth, verifyHostelOwnership, async (req, res) => {
  try {
    const { reason } = req.body;
    const paymentRequest = await PaymentRequest.findById(req.params.id);
    
    if (!paymentRequest) {
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    // Verify manager owns the hostel
    if (!req.manager.hostels.includes(paymentRequest.hostel.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    paymentRequest.status = 'rejected';
    paymentRequest.reviewedBy = req.user.id;
    paymentRequest.reviewedAt = new Date();
    paymentRequest.rejectionReason = reason || 'No reason provided';
    await paymentRequest.save();

    // Update related booking/reservation
    if (paymentRequest.paymentType === 'visit' && paymentRequest.relatedBooking) {
      const booking = await VisitBooking.findById(paymentRequest.relatedBooking);
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }
    } else if (paymentRequest.paymentType === 'reservation' && paymentRequest.relatedReservation) {
      const reservation = await SeatReservation.findById(paymentRequest.relatedReservation);
      if (reservation) {
        reservation.status = 'cancelled';
        await reservation.save();
      }
    }

    res.json({ success: true, message: 'Payment rejected', paymentRequest });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reservations for manager's hostels
router.get('/reservations', auth, verifyHostelOwnership, async (req, res) => {
  try {
    const reservations = await SeatReservation.find({ hostel: { $in: req.manager.hostels } })
      .populate('user', 'name email phone')
      .populate('hostel', 'name location')
      .populate('paymentRequest')
      .sort({ createdAt: -1 });

    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
