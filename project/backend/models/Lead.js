const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['enquiry', 'contact'],
    required: true
  },
  // Common fields
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Enquiry specific fields
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  hostelName: String,
  checkInDate: Date,
  roomType: String,
  userType: String,
  institution: String,
  course: String,
  budget: String,
  
  // Contact specific fields
  subject: String,
  company: String,
  
  // Common tracking fields
  source: {
    type: String,
    default: 'website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: [{
    text: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);