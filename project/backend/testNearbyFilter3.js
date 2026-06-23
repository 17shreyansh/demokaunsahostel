const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');

mongoose.connect('mongodb://localhost:27017/hostel_enquiry', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const hostel = await Hostel.findOne();
    hostel.nearbyPlaces.educational.push({ name: 'Test College', distance: '1.5 km' });
    await hostel.save();
    console.log("Updated hostel", hostel.name);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
