const axios = require('axios');

async function testNearbyPlacesAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing Nearby Places API endpoints...\n');
    
    // Test 1: Get all nearby places
    console.log('1. Testing GET /api/nearbyplaces');
    const nearbyPlacesResponse = await axios.get(`${baseURL}/nearbyplaces`);
    console.log(`✅ Found ${nearbyPlacesResponse.data.length} nearby places`);
    
    if (nearbyPlacesResponse.data.length > 0) {
      const samplePlace = nearbyPlacesResponse.data[0];
      console.log(`   Sample: ${samplePlace.name} (${samplePlace.category})\n`);
      
      // Test 2: Get filter options
      console.log('2. Testing GET /api/hostels/filters/options');
      const filterOptionsResponse = await axios.get(`${baseURL}/hostels/filters/options`);
      console.log(`✅ Found ${filterOptionsResponse.data.nearbyPlaces?.length || 0} nearby places in filter options`);
      
      if (filterOptionsResponse.data.nearbyPlaces?.length > 0) {
        console.log(`   Sample options: ${filterOptionsResponse.data.nearbyPlaces.slice(0, 3).join(', ')}\n`);
      }
      
      // Test 3: Search hostels without filter
      console.log('3. Testing GET /api/hostels (no filter)');
      const allHostelsResponse = await axios.get(`${baseURL}/hostels`);
      console.log(`✅ Found ${allHostelsResponse.data.hostels.length} total hostels\n`);
      
      // Test 4: Search hostels with nearby place filter
      console.log(`4. Testing GET /api/hostels?nearbyPlace=${encodeURIComponent(samplePlace.name)}`);
      const filteredHostelsResponse = await axios.get(`${baseURL}/hostels?nearbyPlace=${encodeURIComponent(samplePlace.name)}`);
      console.log(`✅ Found ${filteredHostelsResponse.data.hostels.length} hostels near "${samplePlace.name}"`);
      
      if (filteredHostelsResponse.data.hostels.length > 0) {
        console.log('   Filtered hostels:');
        filteredHostelsResponse.data.hostels.forEach(hostel => {
          console.log(`   - ${hostel.name} (${hostel.location})`);
        });
      } else {
        console.log('   ❌ No hostels found with this nearby place filter');
        console.log('   This might indicate the filter is not working correctly');
      }
      
    } else {
      console.log('❌ No nearby places found in database');
    }
    
  } catch (error) {
    console.error('API Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testNearbyPlacesAPI();