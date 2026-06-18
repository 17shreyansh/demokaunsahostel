const express = require('express');
const multer = require('multer');
const PaymentRequest = require('../models/PaymentRequest');
const VisitBooking = require('../models/VisitBooking');
const SeatReservation = require('../models/SeatReservation');
const Hostel = require('../models/Hostel');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/payments/',
  filename: (req, file, cb) => cb(null, `payment-${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Submit visit payment
router.post('/visit', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { hostelId, upiTransactionId, notes, bookingId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot required' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const booking = await VisitBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const paymentRequest = new PaymentRequest({
      user: req.user.id,
      hostel: hostelId,
      paymentType: 'visit',
      amount: booking.amount,
      upiTransactionId,
      screenshot: req.file.filename,
      notes,
      relatedBooking: bookingId
    });

    await paymentRequest.save();

    booking.paymentStatus = 'pending';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment submitted successfully. Awaiting hostel approval.',
      paymentRequest
    });
  } catch (error) {
    console.error('Visit payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit reservation payment
router.post('/reservation', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { hostelId, upiTransactionId, notes, sharingType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot required' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (!hostel.reservationEnabled) {
      return res.status(400).json({ success: false, message: 'Reservation not enabled for this hostel' });
    }

    // Create reservation
    const reservation = new SeatReservation({
      user: req.user.id,
      hostel: hostelId,
      sharingType,
      reservationAmount: hostel.reservationAmount,
      status: 'pending'
    });

    await reservation.save();

    // Create payment request
    const paymentRequest = new PaymentRequest({
      user: req.user.id,
      hostel: hostelId,
      paymentType: 'reservation',
      amount: hostel.reservationAmount,
      upiTransactionId,
      screenshot: req.file.filename,
      notes,
      sharingType,
      relatedReservation: reservation._id
    });

    await paymentRequest.save();

    reservation.paymentRequest = paymentRequest._id;
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation payment submitted successfully. Awaiting hostel approval.',
      paymentRequest,
      reservation
    });
  } catch (error) {
    console.error('Reservation payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit installment payment
router.post('/installment', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { assignmentId, installmentIndex, upiTransactionId, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot required' });
    }

    const UserHostelAssignment = require('../models/UserHostelAssignment');
    const assignment = await UserHostelAssignment.findOne({
      _id: assignmentId,
      user: req.user.id
    }).populate('hostel');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (!assignment.selectedInstallmentPlan) {
      return res.status(400).json({ success: false, message: 'No installment plan selected' });
    }

    const installmentPayment = assignment.installmentPayments[installmentIndex];
    if (!installmentPayment) {
      return res.status(404).json({ success: false, message: 'Installment not found' });
    }

    if (installmentPayment.paid) {
      return res.status(400).json({ success: false, message: 'Installment already paid' });
    }

    // Create payment request
    const paymentRequest = new PaymentRequest({
      user: req.user.id,
      hostel: assignment.hostel._id,
      paymentType: 'installment',
      amount: installmentPayment.amount,
      upiTransactionId,
      screenshot: req.file.filename,
      notes,
      relatedAssignment: assignmentId,
      installmentIndex
    });

    await paymentRequest.save();

    // Mark installment as pending approval
    assignment.installmentPayments[installmentIndex].paymentRequest = paymentRequest._id;
    assignment.installmentPayments[installmentIndex].status = 'pending';
    await assignment.save();

    res.json({
      success: true,
      message: 'Installment payment submitted successfully. Awaiting hostel approval.',
      paymentRequest
    });
  } catch (error) {
    console.error('Installment payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's payment requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await PaymentRequest.find({ user: req.user.id })
      .populate('hostel', 'name location images')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all payment requests
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.paymentType = type;

    const requests = await PaymentRequest.find(query)
      .populate('user', 'name email phone')
      .populate('hostel', 'name location')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PaymentRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
