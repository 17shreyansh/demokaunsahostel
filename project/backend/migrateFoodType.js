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

    const resultBoth = await Hostel.updateMany(
      { foodType: 'Both' },
      { $set: { foodType: 'Veg' } }
    );
    console.log(`Updated ${resultBoth.modifiedCount} hostels from 'Both' to 'Veg'.`);

    const resultVegOnly = await Hostel.updateMany(
      { foodType: 'Veg Only' },
      { $set: { foodType: 'Pure Veg' } }
    );
    console.log(`Updated ${resultVegOnly.modifiedCount} hostels from 'Veg Only' to 'Pure Veg'.`);

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
