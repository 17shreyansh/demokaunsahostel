const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');

const fixFeaturedHostels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB');

    // Get all hostels
    const hostels = await Hostel.find({});
    console.log(`Found ${hostels.length} hostels`);

    if (hostels.length === 0) {
      console.log('No hostels found. Please run seed.js first.');
      return;
    }

    // Mark first 6 hostels as featured if none are featured
    const featuredCount = await Hostel.countDocuments({ featured: true });
    console.log(`Currently ${featuredCount} featured hostels`);

    if (featuredCount === 0) {
      const hostelIds = hostels.slice(0, 6).map(h => h._id);
      await Hostel.updateMany(
        { _id: { $in: hostelIds } },
        { $set: { featured: true } }
      );
      console.log('Marked first 6 hostels as featured');
    }

    // Ensure all hostels have proper slugs
    for (const hostel of hostels) {
      if (!hostel.slug) {
        hostel.slug = hostel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await hostel.save();
        console.log(`Added slug for ${hostel.name}: ${hostel.slug}`);
      }
    }

    console.log('Featured hostels fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixFeaturedHostels();