const mongoose = require('mongoose');
require('dotenv').config();

const Hostel = require('./models/Hostel');

const updateRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    
    const ratingUpdates = [
      { name: 'Alpha Student Abode', rating: 4.7 },
      { name: 'Professional\'s Hub', rating: 4.5 },
      { name: 'Gamer\'s Paradise PG', rating: 4.8 },
      { name: 'Secure Haven (Girls)', rating: 4.6 },
      { name: 'Smart Saver\'s Stay', rating: 4.2 },
      { name: 'The Executive Suite', rating: 4.9 }
    ];

    for (const update of ratingUpdates) {
      await Hostel.updateOne(
        { name: update.name },
        { $set: { rating: update.rating } }
      );
      console.log(`Updated rating for ${update.name}: ${update.rating}`);
    }

    console.log('All ratings updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
};

updateRatings();