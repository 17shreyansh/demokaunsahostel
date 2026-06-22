const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  userType: {
    type: String
  },
  source: {
    type: String,
    default: 'website'
  },
  hostelName: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Resolved'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);