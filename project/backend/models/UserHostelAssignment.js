const mongoose = require('mongoose');

const userHostelAssignmentSchema = new mongoose.Schema({
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  canReview: {
    type: Boolean,
    default: true
  },
  hasReviewed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  selectedSharingType: {
    type: String
  },
  useHostelPayment: {
    type: Boolean,
    default: true,
    comment: 'If true, payments go to hostel owner. If false, payments go to admin.'
  },
  selectedInstallmentPlan: {
    type: mongoose.Schema.Types.ObjectId
  },
  installmentPayments: [{
    installmentIndex: Number,
    amount: Number,
    paid: { type: Boolean, default: false },
    paidDate: Date,
    paymentMethod: String,
    transactionId: String,
    paymentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentRequest'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

userHostelAssignmentSchema.index({ user: 1, hostel: 1 }, { unique: true });

module.exports = mongoose.model('UserHostelAssignment', userHostelAssignmentSchema);
