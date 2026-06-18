const express = require('express');
const multer = require('multer');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `admin-qr-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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

// Get payment configuration
router.get('/payment-config', auth, async (req, res) => {
  try {
    const upiSetting = await Settings.findOne({ key: 'admin_upi_id' });
    const qrSetting = await Settings.findOne({ key: 'admin_qr_code' });
    const instructionsSetting = await Settings.findOne({ key: 'admin_payment_instructions' });

    res.json({
      success: true,
      settings: {
        upiId: upiSetting?.value || '',
        qrCode: qrSetting?.value || '',
        paymentInstructions: instructionsSetting?.value || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save payment configuration
router.post('/payment-config', auth, upload.single('qrCode'), async (req, res) => {
  try {
    const { upiId, paymentInstructions } = req.body;

    // Save UPI ID
    await Settings.findOneAndUpdate(
      { key: 'admin_upi_id' },
      { value: upiId || '', category: 'payment' },
      { upsert: true }
    );

    // Save QR Code filename if uploaded
    if (req.file) {
      await Settings.findOneAndUpdate(
        { key: 'admin_qr_code' },
        { value: req.file.filename, category: 'payment' },
        { upsert: true }
      );
    }

    // Save payment instructions
    await Settings.findOneAndUpdate(
      { key: 'admin_payment_instructions' },
      { value: paymentInstructions || '', category: 'payment' },
      { upsert: true }
    );

    res.json({ success: true, message: 'Payment settings saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;