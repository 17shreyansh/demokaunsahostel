const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Hostel = require('./models/Hostel');

// Helper to parse numbers
const parsePrice = (val, addAmount = 0) => {
  if (!val) return null;
  let str = val.toString().toLowerCase().replace(/,/g, '');
  let match = str.match(/\d+(\.\d+)?/);
  if (!match) return null;
  let num = parseFloat(match[0]);
  if (str.includes('lakh') || str.includes('lac')) num *= 100000;
  else if (str.includes('k') && num < 1000) num *= 1000;
  
  if (num > 0) {
    return parseInt(num) + addAmount;
  }
  return null;
};

const mapGender = (val, name) => {
  let genderVal = (val || '').toLowerCase();
  let nameVal = (name || '').toLowerCase();
  
  if (genderVal.includes('female') || nameVal.includes('girl') || nameVal.includes('female')) return 'Girls';
  if (genderVal.includes('male') || nameVal.includes('boy') || nameVal.includes('male')) return 'Boys';
  return 'Co-ed';
};

const mapFoodType = (val) => {
  if (!val) return 'Both';
  val = val.toLowerCase();
  if (val.includes('veg') && val.includes('non')) return 'Both';
  if (val.includes('veg')) return 'Veg Only';
  if (val.includes('non')) return 'Non-Veg Only';
  return 'Both';
};

const seed = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry'
    );
    console.log('✅ Connected to DB');
    
    // Wipe collection for a perfect clean seed
    await Hostel.deleteMany({});
    console.log('Cleared existing hostels');

    const data = fs.readFileSync(path.join(__dirname, 'hostelsData.tsv'), 'utf8');
    const rows = data.split('\n').filter(r => r.trim());
    
    // Start from row 1 since 0 is probably header if there was one, but wait, the TSV doesn't have a header. 
    // It is raw data, we iterate through everything.
    
    for (let row of rows) {
      const cols = row.split('\t');
      if (cols.length < 10) continue;

      const name = cols[1]?.trim();
      if (!name || name === 'Hostel Name') continue;

      const amenitiesRaw = cols[3]?.trim() || '';
      const amenities = amenitiesRaw.split(',').map(a => a.trim()).filter(a => a);
      const foodTypeRaw = cols[4]?.trim() || '';
      
      const roomTypes = [];
      
      // Occupancy extraction (cols 11-14 are capacities, cols 15-18 are prices)
      const occupancyTypes = [
        { name: 'Single Occupancy', availIndex: 11, priceIndex: 15 },
        { name: 'Double Occupancy', availIndex: 12, priceIndex: 16 },
        { name: 'Triple Occupancy', availIndex: 13, priceIndex: 17 },
        { name: 'Four Occupancy', availIndex: 14, priceIndex: 18 }
      ];

      occupancyTypes.forEach(occ => {
        const capacityRaw = cols[occ.availIndex];
        const capacity = parseInt(capacityRaw) || 0;
        
        // ADD 10,000 TO RENT AS REQUESTED
        const price = parsePrice(cols[occ.priceIndex], 10000); 
        
        if (capacity > 0 || (price && price > 0)) {
          roomTypes.push({
            name: occ.name,
            type: occ.name,
            price: price || 0,
            available: capacity,
            priceType: (price && price > 50000) ? 'session' : 'month'
          });
        }
      });

      const minPrice = roomTypes.length > 0 ? Math.min(...roomTypes.map(rt => rt.price).filter(p => p > 0)) : 0;
      const priceType = minPrice > 50000 ? 'session' : 'month';

      const genderRaw = cols[21]?.trim();
      const location = cols[22]?.trim() || 'Not Specified';
      const securityDeposit = parsePrice(cols[7]);



      // Generate a dynamic description
      const genderTypeStr = mapGender(genderRaw, name).toLowerCase() === 'girls' ? 'girls' : mapGender(genderRaw, name).toLowerCase() === 'boys' ? 'boys' : 'students';
      const description = `${name} is a premium accommodation designed specifically for ${genderTypeStr}, located in ${location}. Offering a comfortable, secure, and home-like environment, it comes fully equipped with excellent modern facilities including ${amenities.slice(0, 6).join(', ')}. Whether you're looking for focused study time or a vibrant community, ${name} provides the perfect blend of convenience, safety, and comfort to ensure an optimal living experience.`;

      const paymentRatioRaw = cols[5]?.trim();
      const installmentPlans = [];
      if (paymentRatioRaw && paymentRatioRaw.includes('/')) {
        const ratios = paymentRatioRaw.split(',')[0].split('/').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
        if (ratios.length > 0) {
          installmentPlans.push({
            name: 'Standard Payment Plan',
            type: 'percentage',
            installments: ratios.map(value => ({ value }))
          });
        }
      }

      const gateClosingTime = cols[9]?.trim();
      const acTimings = cols[10]?.trim();
      const transportationExtra = cols[19]?.trim();
      const oneTimeDiscount = cols[6]?.trim();

      const rules = [];
      if (gateClosingTime && gateClosingTime.toLowerCase() !== 'no' && gateClosingTime.toLowerCase() !== 'na') {
        rules.push(`Gate Closing Time: ${gateClosingTime}`);
      }

      const info = [];
      if (acTimings && acTimings.toLowerCase() !== 'no' && acTimings.toLowerCase() !== 'na' && acTimings.toLowerCase() !== 'nil') {
        info.push({ title: 'AC Timings', value: acTimings });
      }
      if (transportationExtra && transportationExtra.toLowerCase() !== 'no' && transportationExtra.toLowerCase() !== 'na' && transportationExtra.toLowerCase() !== 'nil' && transportationExtra !== '0') {
        info.push({ title: 'Transportation', value: `Extra Charges: ${transportationExtra}` });
      }
      if (oneTimeDiscount && oneTimeDiscount.toLowerCase() !== 'no' && oneTimeDiscount.toLowerCase() !== 'na' && oneTimeDiscount !== '0' && oneTimeDiscount.toLowerCase() !== 'nil') {
        info.push({ title: 'One Time Payment Discount', value: oneTimeDiscount });
      }

      const hostelData = {
        name,
        description,
        location,
        price: minPrice,
        priceType,
        amenities,
        roomTypes,
        sharingTypes: roomTypes, 
        gender: mapGender(genderRaw, name),
        foodType: mapFoodType(foodTypeRaw),
        securityDeposit: securityDeposit || 0,
        type: name.toLowerCase().includes('pg') ? 'PG' : 'Hostel',
        capacity: '50+ Students',
        images: [], // No dummy images as requested
        checkIn: 'Flexible timing',
        verified: true, // Make all verified as requested
        contactInfo: {
          address: location,
        },
        nearbyPlaces: {
          educational: [], office: [], transportation: [], shopping: [],
          healthcare: [], entertainment: [], restaurant: [], banking: []
        },
        installmentPlans,
        rules,
        info,
        reviews: [],
        reservationEnabled: false,
        reservationAmount: parsePrice(cols[8]) || 0
      };
      
      if (hostelData.reservationAmount > 0) {
        hostelData.reservationEnabled = true;
      }

      let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await Hostel.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const existing = await Hostel.findOne({ name, location });
      if (!existing) {
        hostelData.slug = slug;
        await Hostel.create(hostelData);
        console.log(`✅ Created: ${name} at ${location}`);
      } else {
        console.log(`ℹ️ Already exists: ${name} at ${location}`);
      }
    }

    console.log('🎉 Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seed();
