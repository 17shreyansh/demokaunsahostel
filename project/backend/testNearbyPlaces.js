const mongoose = require('mongoose');
require('dotenv').config();

const NearbyPlaces = require('./models/NearbyPlaces');

async function testNearbyPlaces() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test creating a nearby place with coordinates input
    const testPlace = new NearbyPlaces({
      name: 'Test College',
      category: 'educational',
      type: 'College',
      coordinates: '28.6139, 77.2090'
    });

    await testPlace.save();
    console.log('Test place created:', testPlace);

    // Test fetching categories
    const response = await fetch('http://localhost:5000/api/nearbyplaces/categories');
    const categories = await response.json();
    console.log('Categories:', categories);

    await mongoose.disconnect();
    console.log('Test completed');
  } catch (error) {
    console.error('Test error:', error);
  }
}

testNearbyPlaces();