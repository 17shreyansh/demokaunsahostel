const mongoose = require('mongoose');
const HostelManager = require('./models/HostelManager');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Get all managers
    const managers = await HostelManager.find({}, {name: 1, email: 1, _id: 1, 'kyc.status': 1});
    
    console.log('=== All Hostel Managers ===');
    managers.forEach(m => {
      console.log(`ID: ${m._id}`);
      console.log(`Name: ${m.name}`);
      console.log(`Email: ${m.email}`);
      console.log(`KYC Status: ${m.kyc?.status || 'pending'}`);
      console.log('---');
    });
    
    // Check the specific ID
    const problematicId = '689cb2fe59962e90d5d3843b';
    console.log(`\n=== Checking ID: ${problematicId} ===`);
    
    try {
      const manager = await HostelManager.findById(problematicId);
      if (manager) {
        console.log('Manager FOUND:', manager.name, manager.email);
      } else {
        console.log('Manager NOT FOUND with this ID');
        console.log('This ID does not exist in the database');
      }
    } catch (error) {
      console.log('Error querying ID:', error.message);
    }
    
    // Check if there's a token mismatch
    console.log('\n=== Token Test ===');
    if (managers.length > 0) {
      const testManager = managers[0];
      const token = jwt.sign(
        { id: testManager._id, role: 'hostel-manager' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
      );
      console.log(`Valid token for ${testManager.email}:`);
      console.log(token);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded ID:', decoded.id);
      console.log('Actual ID:', testManager._id.toString());
      console.log('Match:', decoded.id === testManager._id.toString());
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
