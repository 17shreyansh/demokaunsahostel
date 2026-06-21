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
    const placesWithDistances = [];

    for (const place of places) {
      try {
        const roadDistance = await calculateRoadDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          place.mapCoordinates.lat, 
          place.mapCoordinates.lng
        );
        
        placesWithDistances.push({
          ...place.toObject(),
          distance: roadDistance
        });
      } catch (error) {
        // Fallback to straight-line distance
        const straightDistance = calculateStraightDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          place.mapCoordinates.lat, 
          place.mapCoordinates.lng
        );
        
        placesWithDistances.push({
          ...place.toObject(),
          distance: `~${straightDistance.toFixed(1)} km`
        });
      }
    }

    // Sort by distance
    placesWithDistances.sort((a, b) => {
      const aNum = parseFloat(String(a.distance).replace(/[^\\d.-]/g, '')) || 999;
      const bNum = parseFloat(String(b.distance).replace(/[^\\d.-]/g, '')) || 999;
      return aNum - bNum;
    });

    res.json(placesWithDistances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate road distance using OpenRouteService API
async function calculateRoadDistance(lat1, lng1, lat2, lng2) {
  try {
    // Get API key directly from database
    const Settings = require('../models/Settings');
    const setting = await Settings.findOne({ key: 'openroute_api_key' });
    const apiKey = setting ? setting.value : null;
    
    console.log('API Key found:', !!apiKey, 'Key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey || apiKey.length < 10) {
      console.log('No valid API key, using fallback');
      throw new Error('OpenRoute API key not configured');
    }
    
    console.log('Making API request to OpenRoute...');
    const response = await axios.get(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        params: {
          api_key: apiKey,
          start: `${lng1},${lat1}`,
          end: `${lng2},${lat2}`
        },
        timeout: 10000
      }
    );
    
    console.log('OpenRoute API response status:', response.status);
    
    if (response.data.features && response.data.features[0]) {
      const distance = response.data.features[0].properties.segments[0].distance / 1000;
      console.log('Road distance calculated:', distance, 'km');
      return `${distance.toFixed(1)} km`;
    }
    
    throw new Error('Invalid response from routing service');
  } catch (error) {
    console.error('Road distance calculation failed:', error.message);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', error.response.data);
    }
    throw error;
  }
}

// Calculate straight-line distance (Haversine formula)
function calculateStraightDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
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