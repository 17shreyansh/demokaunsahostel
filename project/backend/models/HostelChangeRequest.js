const mongoose = require('mongoose');

const hostelChangeRequestSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelManager',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  requestType: {
    type: String,
    enum: ['create', 'update'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  changeData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previousData: {
    type: mongoose.Schema.Types.Mixed
  },
  rejectionReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

hostelChangeRequestSchema.index({ manager: 1, status: 1 });
hostelChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('HostelChangeRequest', hostelChangeRequestSchema);
