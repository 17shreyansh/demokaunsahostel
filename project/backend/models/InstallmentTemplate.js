const mongoose = require('mongoose');

const installmentTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  installments: [{
    value: {
      type: Number,
      required: true
    },
    dueDate: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('InstallmentTemplate', installmentTemplateSchema);
