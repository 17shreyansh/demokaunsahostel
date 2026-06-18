const mongoose = require('mongoose');

const seatReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  sharingType: {
    type: String,
    required: true
  },
  reservationAmount: {
    type: Number,
    required: true
  },
  paymentRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentRequest'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

seatReservationSchema.index({ user: 1, hostel: 1, status: 1 });

module.exports = mongoose.model('SeatReservation', seatReservationSchema);
