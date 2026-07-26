const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hostelManagerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  businessName: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  kyc: {
    status: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending'
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String
    },
    paymentDetails: {
      upiId: String,
      qrCode: String
    },
    submittedAt: Date,
    verifiedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    history: [{
      status: String,
      timestamp: Date,
      reason: String,
      adminId: mongoose.Schema.Types.ObjectId
    }]
  },
  hostels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

hostelManagerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

hostelManagerSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('HostelManager', hostelManagerSchema);
