const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');
require('dotenv').config();

async function testUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB');

    // Find a hostel to update
    const hostels = await Hostel.find().limit(1);
    if (hostels.length === 0) {
      console.log('No hostels found');
      return;
    }

    const hostel = hostels[0];
    console.log('Found hostel:', hostel.name);
    console.log('Current description:', hostel.description);

    // Update the hostel
    const updatedDescription = `Updated at ${new Date().toISOString()} - ${hostel.description}`;
    const result = await Hostel.findByIdAndUpdate(
      hostel._id,
      { description: updatedDescription },
      { new: true }
    );

    console.log('Update result:', result ? 'Success' : 'Failed');
    console.log('New description:', result?.description);

    // Verify the update
    const verifyHostel = await Hostel.findById(hostel._id);
    console.log('Verification - description matches:', verifyHostel.description === updatedDescription);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testUpdate();