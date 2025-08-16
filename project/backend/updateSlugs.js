const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');

const updateSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    
    const hostels = await Hostel.find({ slug: { $exists: false } });
    
    for (const hostel of hostels) {
      const slug = hostel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      hostel.slug = slug;
      await hostel.save();
      console.log(`Updated ${hostel.name} with slug: ${slug}`);
    }
    
    console.log('All hostels updated with slugs');
    process.exit(0);
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  }
};

updateSlugs();