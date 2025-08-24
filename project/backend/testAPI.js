const axios = require('axios');

const testAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing API endpoints...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${baseURL}/../api/health`);
    console.log('✅ Health check:', health.data);
    
    // Test hostels endpoint
    console.log('\n2. Testing hostels endpoint...');
    const hostels = await axios.get(`${baseURL}/hostels`);
    console.log('✅ Hostels found:', hostels.data.hostels?.length || 0);
    
    // Test featured hostels endpoint
    console.log('\n3. Testing featured hostels endpoint...');
    const featured = await axios.get(`${baseURL}/hostels/featured/homepage`);
    console.log('✅ Featured hostels found:', featured.data?.length || 0);
    
    // Test filter options endpoint
    console.log('\n4. Testing filter options endpoint...');
    const filters = await axios.get(`${baseURL}/hostels/filters/options`);
    console.log('✅ Filter options:', {
      locations: filters.data.locations?.length || 0,
      amenities: filters.data.amenities?.length || 0,
      nearbyPlaces: filters.data.nearbyPlaces?.length || 0
    });
    
    console.log('\n🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testAPI();