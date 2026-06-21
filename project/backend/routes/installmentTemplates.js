const express = require('express');
const router = express.Router();
const InstallmentTemplate = require('../models/InstallmentTemplate');
const auth = require('../middleware/auth');

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await InstallmentTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new template
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, installments } = req.body;
    
    // Validate total percentage if type is percentage
    if (type === 'percentage') {
      const total = installments.reduce((acc, curr) => acc + Number(curr.value), 0);
      if (total !== 100) {
        return res.status(400).json({ message: 'Percentage installments must add up to exactly 100%' });
      }
    }

    const newTemplate = new InstallmentTemplate({
      name,
      type,
      installments
    });

    const savedTemplate = await newTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A template with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update a template
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, installments } = req.body;
    
    if (type === 'percentage') {
      const total = installments.reduce((acc, curr) => acc + Number(curr.value), 0);
      if (total !== 100) {
        return res.status(400).json({ message: 'Percentage installments must add up to exactly 100%' });
      }
    }

    const updatedTemplate = await InstallmentTemplate.findByIdAndUpdate(
      req.params.id,
      { name, type, installments },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(updatedTemplate);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A template with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete a template
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedTemplate = await InstallmentTemplate.findByIdAndDelete(req.params.id);
    if (!deletedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
