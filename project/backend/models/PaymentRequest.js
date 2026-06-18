const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
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
  paymentType: {
    type: String,
    enum: ['visit', 'reservation'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  upiTransactionId: {
    type: String,
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelManager'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  sharingType: {
    type: String
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitBooking'
  },
  relatedReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeatReservation'
  }
}, {
  timestamps: true
});

paymentRequestSchema.index({ user: 1, hostel: 1, status: 1 });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
