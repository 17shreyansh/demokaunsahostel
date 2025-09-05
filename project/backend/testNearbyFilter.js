const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaunsa-college', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Hostel = require('./models/Hostel');
const NearbyPlaces = require('./models/NearbyPlaces');

async function testNearbyPlacesFilter() {
  try {
    console.log('Testing nearby places filter...');
    
    // Test 1: Check if we have nearby places in database
    const nearbyPlacesCount = await NearbyPlaces.countDocuments({ active: true });
    console.log(`Found ${nearbyPlacesCount} nearby places in database`);
    
    if (nearbyPlacesCount > 0) {
      const samplePlace = await NearbyPlaces.findOne({ active: true });
      console.log(`Sample nearby place: ${samplePlace.name} (${samplePlace.category})`);
      
      // Test 2: Check if hostels have nearby places data
      const hostelsWithNearbyPlaces = await Hostel.find({
        $or: [
          { 'nearbyPlaces.educational.name': samplePlace.name },
          { 'nearbyPlaces.office.name': samplePlace.name },
          { 'nearbyPlaces.transportation.name': samplePlace.name },
          { 'nearbyPlaces.shopping.name': samplePlace.name },
          { 'nearbyPlaces.healthcare.name': samplePlace.name },
          { 'nearbyPlaces.entertainment.name': samplePlace.name },
          { 'nearbyPlaces.restaurant.name': samplePlace.name },
          { 'nearbyPlaces.banking.name': samplePlace.name }
        ]
      });
      
      console.log(`Found ${hostelsWithNearbyPlaces.length} hostels with "${samplePlace.name}" in their nearby places`);
      
      if (hostelsWithNearbyPlaces.length > 0) {
        console.log('✅ Nearby places filter should work correctly');
        hostelsWithNearbyPlaces.forEach(hostel => {
          console.log(`  - ${hostel.name} (${hostel.location})`);
        });
      } else {
        console.log('❌ No hostels found with nearby places data');
        console.log('Suggestion: Add nearby places to hostels or check data structure');
      }
    } else {
      console.log('❌ No nearby places found in database');
      console.log('Suggestion: Add nearby places to the database first');
    }
    
    // Test 3: Check hostel nearby places structure
    const sampleHostel = await Hostel.findOne({}).select('name nearbyPlaces');
    if (sampleHostel) {
      console.log(`\nSample hostel nearby places structure for "${sampleHostel.name}":`);
      console.log(JSON.stringify(sampleHostel.nearbyPlaces, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testNearbyPlacesFilter();