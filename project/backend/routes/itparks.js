const express = require('express');
const NearbyPlaces = require('../models/NearbyPlaces');
const auth = require('../middleware/auth');
const axios = require('axios');
const { calculateDistancesWithFallback } = require('../utils/distanceCalculator');
const router = express.Router();

// Get all places by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    
    const places = await NearbyPlaces.find(filter).sort({ category: 1, name: 1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get places with distances from a point
router.get('/distances', async (req, res) => {
  try {
    const { lat, lng, category } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const filter = { active: true };
    if (category) filter.category = category;
    const places = await NearbyPlaces.find(filter);

    const parksWithDistances = await calculateDistancesWithFallback(lat, lng, places);

    // Sort by distance
    parksWithDistances.sort((a, b) => {
      const aNum = parseFloat(String(a.distance).replace(/[^\d.-]/g, '')) || 999;
      const bNum = parseFloat(String(b.distance).replace(/[^\d.-]/g, '')) || 999;
      return aNum - bNum;
    });

    res.json(parksWithDistances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create place
router.post('/', auth, async (req, res) => {
  try {
    const place = new NearbyPlaces(req.body);
    await place.save();
    res.status(201).json(place);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update place
router.put('/:id', auth, async (req, res) => {
  try {
    const place = await NearbyPlaces.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(place);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete place
router.delete('/:id', auth, async (req, res) => {
  try {
    await NearbyPlaces.findByIdAndDelete(req.params.id);
    res.json({ message: 'Place deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;