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

// Get categories with types
router.get('/categories', async (req, res) => {
  try {
    const categories = {
      office: ['IT Park', 'Office Complex', 'Tech Hub', 'Business Center', 'Corporate Office', 'Coworking Space'],
      educational: ['University', 'College', 'Institute', 'School', 'Training Center', 'Library'],
      transportation: ['Metro Station', 'Bus Stop', 'Railway Station', 'Airport', 'Taxi Stand', 'Auto Stand'],
      shopping: ['Mall', 'Market', 'Supermarket', 'Shopping Complex', 'Local Store', 'Grocery Store'],
      healthcare: ['Hospital', 'Clinic', 'Pharmacy', 'Diagnostic Center', 'Emergency Care', 'Dental Clinic'],
      entertainment: ['Cinema', 'Park', 'Sports Complex', 'Gaming Zone', 'Club', 'Recreation Center'],
      restaurant: ['Restaurant', 'Fast Food', 'Cafe', 'Food Court', 'Street Food', 'Bakery'],
      banking: ['Bank', 'ATM', 'Financial Services', 'Insurance Office', 'Money Exchange', 'Post Office']
    };
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get places with road distances from a point
router.get('/distances', async (req, res) => {
  try {
    const { lat, lng, category } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const filter = { active: true };
    if (category) filter.category = category;
    const places = await NearbyPlaces.find(filter);

    const placesWithDistances = await calculateDistancesWithFallback(lat, lng, places);

    // Sort by distance
    placesWithDistances.sort((a, b) => {
      let aNum = parseFloat(String(a.distance).replace(/[^\d.-]/g, '')) || 9999;
      let bNum = parseFloat(String(b.distance).replace(/[^\d.-]/g, '')) || 9999;
      if (String(a.distance).toLowerCase().includes('m') && !String(a.distance).toLowerCase().includes('km')) aNum /= 1000;
      if (String(b.distance).toLowerCase().includes('m') && !String(b.distance).toLowerCase().includes('km')) bNum /= 1000;
      return aNum - bNum;
    });

    res.json(placesWithDistances);
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