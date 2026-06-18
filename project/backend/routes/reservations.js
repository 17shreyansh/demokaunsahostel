const express = require('express');
const SeatReservation = require('../models/SeatReservation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await SeatReservation.find({ user: req.user.id })
      .populate('hostel', 'name location images')
      .populate('paymentRequest')
      .sort({ createdAt: -1 });

    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel reservation
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await SeatReservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (reservation.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel confirmed reservation' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ success: true, message: 'Reservation cancelled', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
