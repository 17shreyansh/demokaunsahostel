const express = require('express');
const NearbyPlaces = require('../models/NearbyPlaces');
const auth = require('../middleware/auth');
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
    const placesWithDistances = [];

    for (const place of places) {
      try {
        // Calculate straight-line distance (more reliable than API)
        const straightDistance = calculateStraightDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          place.mapCoordinates.lat, 
          place.mapCoordinates.lng
        );
        
        placesWithDistances.push({
          ...place.toObject(),
          distance: `${straightDistance.toFixed(1)} km`
        });
      } catch (error) {
        placesWithDistances.push({
          ...place.toObject(),
          distance: 'N/A'
        });
      }
    }

    // Sort by distance
    placesWithDistances.sort((a, b) => {
      const aNum = parseFloat(a.distance);
      const bNum = parseFloat(b.distance);
      return aNum - bNum;
    });

    res.json(placesWithDistances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate straight-line distance (Haversine formula)
function calculateStraightDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

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