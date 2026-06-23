require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel');
  const db = mongoose.connection.db;
  const hostels = await db.collection('hostels').find({}, { projection: { name: 1, 'nearbyPlaces.educational': 1 } }).toArray();
  
  console.log(`Total hostels: ${hostels.length}`);
  const allEducational = new Set();
  
  hostels.forEach(h => {
    if (h.nearbyPlaces && h.nearbyPlaces.educational) {
      if (Array.isArray(h.nearbyPlaces.educational)) {
        h.nearbyPlaces.educational.forEach(p => {
          if (p && p.name) allEducational.add(p.name);
        });
      } else {
        console.log(`Hostel ${h.name} has non-array educational:`, h.nearbyPlaces.educational);
      }
    } else {
        // console.log(`Hostel ${h.name} missing nearbyPlaces or educational`);
    }
  });
  
  console.log("Distinct educational places:", Array.from(allEducational));
  
  const originalHostelFilter = await db.collection('hostels').find({ 'nearbyPlaces.educational': { $exists: true, $not: { $size: 0 } } }).toArray();
  console.log(`Hostels matching $not $size 0 query: ${originalHostelFilter.length}`);
  
  process.exit(0);
}
check().catch(console.error);
