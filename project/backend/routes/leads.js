const express = require('express');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const router = express.Router();

// Create enquiry lead
router.post('/enquiry', async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      type: 'enquiry'
    };
    const lead = new Lead(leadData);
    await lead.save();
    res.status(201).json({ message: 'Enquiry submitted successfully', lead });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create contact lead
router.post('/contact', async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      type: 'contact'
    };
    const lead = new Lead(leadData);
    await lead.save();
    res.status(201).json({ message: 'Contact form submitted successfully', lead });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all leads (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, priority, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const leads = await Lead.find(query)
      .populate('hostelId', 'name location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Lead.countDocuments(query);
    
    res.json({
      leads,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lead status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add note to lead
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const lead = await Lead.findById(req.params.id);
    
    lead.notes.push({
      text,
      addedBy: 'Admin',
      addedAt: new Date()
    });
    
    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;