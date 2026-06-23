const express = require('express');
const router = express.Router();
const City = require('../models/City');
const auth = require('../middleware/auth');

// Get all active cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find({ active: true }).sort({ name: 1 });
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

module.exports = router;
