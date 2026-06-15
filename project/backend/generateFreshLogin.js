const mongoose = require('mongoose');
const HostelManager = require('./models/HostelManager');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function generateFreshLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB\n');
    
    // Find existing manager
    const manager = await HostelManager.findOne({ email: 'test@gmail.com' });
    
    if (!manager) {
      console.log('❌ Manager not found. Creating new one...\n');
      
      // Create new manager
      const newManager = new HostelManager({
        name: 'Test Manager',
        email: 'test@gmail.com',
        phone: '9876543210',
        password: 'password123', // Will be hashed by pre-save hook
        kyc: { status: 'pending', history: [] },
        hostels: [],
        isActive: true
      });
      
      await newManager.save();
      console.log('✅ New manager created!\n');
      console.log('Login Credentials:');
      console.log('Email: test@gmail.com');
      console.log('Password: password123');
      console.log('Manager ID:', newManager._id.toString());
      
    } else {
      console.log('✅ Manager found!\n');
      console.log('Login Credentials:');
      console.log('Email:', manager.email);
      console.log('Password: password123');
      console.log('Manager ID:', manager._id.toString());
      console.log('KYC Status:', manager.kyc.status);
      
      // Generate fresh token
      const token = jwt.sign(
        { id: manager._id, role: 'hostel-manager' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      console.log('\n📝 Fresh Token (for manual testing):');
      console.log(token);
      console.log('\n💡 To use this token:');
      console.log('1. Open browser DevTools (F12)');
      console.log('2. Go to Console tab');
      console.log('3. Paste this and press Enter:');
      console.log(`document.cookie = "manager_token=${token}; path=/; max-age=86400"`);
      console.log('\n4. Or just logout and login normally!');
    }
    
    console.log('\n✅ Done! You can now login at: http://localhost:3000/hostel-manager/auth');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

generateFreshLogin();
