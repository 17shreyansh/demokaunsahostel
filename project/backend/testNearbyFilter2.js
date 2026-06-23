const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');

mongoose.connect('mongodb://localhost:27017/hostel_enquiry', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected");
    const hostels = await Hostel.find({
      $or: [
        { 'nearbyPlaces.educational.0': { $exists: true } },
        { 'nearbyPlaces.office.0': { $exists: true } },
        { 'nearbyPlaces.transportation.0': { $exists: true } },
        { 'nearbyPlaces.shopping.0': { $exists: true } }
      ]
    }).limit(2).select('name nearbyPlaces');
    console.log(JSON.stringify(hostels, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
