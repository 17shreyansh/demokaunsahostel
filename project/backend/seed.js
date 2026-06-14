const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry'
    );

    // Delete existing admins (optional)
    await Admin.deleteMany({});

    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@kaunsahostel.com',
      password: 'admin123'
    });

    console.log('✅ Admin created successfully');
    console.log(admin);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedAdmin();