require('dotenv').config();
const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaunsacollege', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB.');

    // 1. Change 'Veg' and 'Veg Only' to 'Pure Veg'
    const resultVeg = await Hostel.updateMany(
      { foodType: { $in: ['Veg', 'Veg Only'] } },
      { $set: { foodType: 'Pure Veg' } }
    );
    console.log(`Updated ${resultVeg.modifiedCount} hostels to 'Pure Veg'.`);

    // 2. Remove any other food types (e.g. 'Both') except 'Pure Veg' and 'Non-Veg'
    const resultOther = await Hostel.updateMany(
      { foodType: { $nin: ['Pure Veg', 'Non-Veg'] } },
      { $unset: { foodType: "" } }
    );
    console.log(`Removed foodType from ${resultOther.modifiedCount} hostels (others).`);

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
