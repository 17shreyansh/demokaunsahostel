const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');

const updatePricingType = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all existing hostels to have default pricing type as 'month'
    const result = await Hostel.updateMany(
      { priceType: { $exists: false } },
      { $set: { priceType: 'month' } }
    );

    console.log(`Updated ${result.modifiedCount} hostels with default pricing type`);
    
    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

updatePricingType();