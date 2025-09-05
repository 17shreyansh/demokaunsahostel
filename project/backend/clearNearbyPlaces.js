const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');

async function clearNearbyPlaces() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all nearbyPlaces data from hostels
    const result = await Hostel.updateMany(
      {},
      { 
        $set: { 
          nearbyPlaces: {
            educational: [],
            office: [],
            transportation: [],
            shopping: [],
            healthcare: [],
            entertainment: [],
            restaurant: [],
            banking: []
          }
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} hostels`);
    console.log('Nearby places data cleared successfully');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

clearNearbyPlaces();