const axios = require('axios');
const Settings = require('../models/Settings');

// Calculate road distances using OpenRouteService Matrix API
async function calculateDistancesWithFallback(sourceLat, sourceLng, places) {
  const placesWithDistances = [];
  
  if (!places || places.length === 0) return placesWithDistances;

  try {
    const setting = await Settings.findOne({ key: 'openroute_api_key' });
    const apiKey = setting ? setting.value : null;

    if (apiKey && apiKey.length >= 10) {
      const locations = [[parseFloat(sourceLng), parseFloat(sourceLat)]]; // index 0 is source
      places.forEach(place => {
        locations.push([place.mapCoordinates.lng, place.mapCoordinates.lat]);
      });

      const destinations = Array.from({ length: places.length }, (_, idx) => idx + 1);

      try {
        const response = await axios.post(
          'https://api.openrouteservice.org/v2/matrix/driving-car',
          {
            locations,
            sources: [0],
            destinations,
            metrics: ["distance"]
          },
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        const distances = response.data.distances[0]; // array of distances from source to each dest

        places.forEach((place, index) => {
          const dist = distances[index] / 1000; // in km
          placesWithDistances.push({
            ...place.toObject(),
            distance: `${dist.toFixed(1)} km`
          });
        });
        
        return placesWithDistances;
      } catch (error) {
        console.error("Matrix API error", error.message);
      }
    }
  } catch (err) {
    console.error("Error retrieving API key", err.message);
  }

  // Fallback if API fails or no API key
  places.forEach(place => {
    placesWithDistances.push({
      ...place.toObject(),
      distance: 'N/A'
    });
  });

  return placesWithDistances;
}

module.exports = {
  calculateDistancesWithFallback
};
