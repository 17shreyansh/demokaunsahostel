const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');

mongoose.connect('mongodb://127.0.0.1:27017/kaunsacollege').then(async () => {
  const h = await Hostel.findOne({ securityDeposit: { $gt: 0 } });
  if (h) {
    console.log('Hostel:', h.name);
    console.log('Price:', h.price);
    console.log('Security Deposit:', h.securityDeposit);
    console.log('SharingTypes:', h.sharingTypes.map(s => s.price));
  } else {
    console.log('No hostel found with security deposit > 0');
  }
  process.exit(0);
});
