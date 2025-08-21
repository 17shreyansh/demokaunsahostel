const express = require('express');
const NearbyPlaces = require('../models/NearbyPlaces');
const auth = require('../middleware/auth');
const axios = require('axios');
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
    const parksWithDistances = [];

    for (const place of places) {
      try {
        // Calculate road distance using OpenRouteService
        const distance = await calculateRoadDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          place.mapCoordinates.lat, 
          place.mapCoordinates.lng
        );
        
        parksWithDistances.push({
          ...place.toObject(),
          distance: distance
        });
      } catch (error) {
        // Fallback to straight-line distance if API fails
        const straightDistance = calculateStraightDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          place.mapCoordinates.lat, 
          place.mapCoordinates.lng
        );
        
        parksWithDistances.push({
          ...place.toObject(),
          distance: `${straightDistance.toFixed(1)} km (approx)`
        });
      }
    }

    // Sort by distance
    parksWithDistances.sort((a, b) => {
      const aNum = parseFloat(a.distance);
      const bNum = parseFloat(b.distance);
      return aNum - bNum;
    });

    res.json(parksWithDistances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate road distance using OpenRouteService (free API)
async function calculateRoadDistance(lat1, lng1, lat2, lng2) {
  try {
    const response = await axios.get(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248YOUR_API_KEY&start=${lng1},${lat1}&end=${lng2},${lat2}`
    );
    
    const distanceMeters = response.data.features[0].properties.segments[0].distance;
    const distanceKm = (distanceMeters / 1000).toFixed(1);
    return `${distanceKm} km`;
  } catch (error) {
    // Fallback to straight-line distance
    return calculateStraightDistance(lat1, lng1, lat2, lng2).toFixed(1) + ' km (approx)';
  }
}

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