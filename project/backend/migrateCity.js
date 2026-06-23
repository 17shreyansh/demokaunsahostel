require('dotenv').config();
const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');
const City = require('./models/City');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB.');

    // Fetch all unique locations to create cities from them if needed, or just default to 'Greater Noida'
    const hostels = await Hostel.find({});
    console.log(`Found ${hostels.length} hostels.`);

    let newCities = new Set();
    
    for (const hostel of hostels) {
      let cityName = 'Greater Noida'; // Default
      
      if (hostel.location) {
        if (hostel.location.toLowerCase().includes('greater noida')) {
          cityName = 'Greater Noida';
        } else if (hostel.location.toLowerCase().includes('noida')) {
          cityName = 'Noida';
        } else {
          cityName = hostel.location; // If it's something else, use it as city
        }
      }
      
      newCities.add(cityName);
      
      await Hostel.updateOne({ _id: hostel._id }, { $set: { city: cityName } });
    }
    
    console.log('Hostels updated with city field.');

    for (const cityName of newCities) {
      const existing = await City.findOne({ name: { $regex: new RegExp('^' + cityName + '$', 'i') } });
      if (!existing) {
        await City.create({ name: cityName });
        console.log(`Created new city: ${cityName}`);
      }
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
