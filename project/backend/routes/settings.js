const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const router = express.Router();

// Get setting value (internal API calls)
router.get('/value/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json({ value: setting ? setting.getDecryptedValue() : null, exists: !!setting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if API key exists (for status display)
router.get('/status/api-key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'openroute_api_key' });
    const exists = !!setting && !!setting.getDecryptedValue();
    res.json({ 
      configured: exists,
      message: exists ? 'API Key is configured' : 'API Key not configured'
    });
  } catch (error) {
    res.status(500).json({ configured: false, message: 'Error checking API key status' });
  }
});

// Save/Update setting (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { key, value, description, category = 'general' } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, description, category, encrypted: false },
      { upsert: true, new: true }
    );
    
    console.log('Saved setting:', setting);
    res.json({ success: true, message: 'Setting saved successfully' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;