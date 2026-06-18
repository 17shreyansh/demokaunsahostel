const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const auth = require('../middleware/auth');

// Public - Get all active FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin - Create FAQ
router.post('/', auth, async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin - Update FAQ
router.put('/:id', auth, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin - Delete FAQ
router.delete('/:id', auth, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
