const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  encrypted: { type: Boolean, default: false },
  description: { type: String },
  category: { type: String, default: 'general' }
}, { timestamps: true });

// Simple methods without encryption for now
settingsSchema.methods.getDecryptedValue = function() {
  return this.value;
};

module.exports = mongoose.model('Settings', settingsSchema);