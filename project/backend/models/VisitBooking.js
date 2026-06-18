const mongoose = require('mongoose');

const visitBookingSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    default: 299
  },
  isFree: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // Legacy Razorpay fields - kept for backward compatibility, disabled
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  visitDate: {
    type: Date
  },
  visitStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

visitBookingSchema.index({ user: 1, hostel: 1 });

module.exports = mongoose.model('VisitBooking', visitBookingSchema);
