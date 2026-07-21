const express = require('express');
const router = express.Router();
const City = require('../models/City');
const auth = require('../middleware/auth');

// Get cities (all or active only)
router.get('/', async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { active: true };
    const cities = await City.find(query).sort({ name: 1 });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new city
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'City name is required' });
    }

    // Check if city already exists (case-insensitive)
    const existingCity = await City.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (existingCity) {
      return res.status(400).json({ message: 'City already exists' });
    }

    const city = new City({ name });
    await city.save();

    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a city
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, active } = req.body;
    
    // If name is being changed, check if new name already exists
    if (name) {
      const existingCity = await City.findOne({ 
        name: { $regex: new RegExp('^' + name + '$', 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCity) {
        return res.status(400).json({ message: 'City already exists' });
      }
    }

    const city = await City.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name }), ...(active !== undefined && { active }) } },
      { new: true }
    );

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a city
router.delete('/:id', auth, async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
