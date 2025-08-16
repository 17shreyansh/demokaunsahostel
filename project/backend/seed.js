const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');
const Hostel = require('./models/Hostel');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    
    // Create admin user
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({
        username: 'admin',
        email: 'admin@kaunsahostel.com',
        password: 'admin123'
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Create sample hostels
    const hostelCount = await Hostel.countDocuments();
    if (hostelCount === 0) {
      const hostels = [
        {
          name: 'Alpha Student Abode',
          description: 'Ideal for students of nearby universities. Includes high-speed Wi-Fi, 3 meals, and 24/7 security.',
          location: 'Knowledge Park III, Greater Noida',
          price: 8500,
          amenities: ['High-Speed WiFi', '3 Meals Daily', '24/7 Security', 'AC Rooms', 'Laundry Service'],
          availability: 'Available',
          info: [
            { title: 'Security Deposit', value: '₹10,000' },
            { title: 'Available Rooms', value: '12' },
            { title: 'Room Types', value: 'Single, Double' }
          ],
          rules: [
            'No smoking inside the premises',
            'Visitors allowed till 8 PM only',
            'Maintain cleanliness in common areas',
            'No loud music after 10 PM'
          ],
          type: 'PG',
          gender: 'Co-ed',
          nearbyPlaces: {
            educational: [
              { name: 'Galgotias University', distance: '2 km' },
              { name: 'Sharda University', distance: '3 km' },
              { name: 'GALGOTIAS College', distance: '1.5 km' }
            ],
            offices: [
              { name: 'Wipro', distance: '4 km' },
              { name: 'TCS', distance: '5 km' },
              { name: 'Tech Mahindra', distance: '3 km' }
            ]
          },
          reviews: [
            { name: 'Rahul Kumar', rating: 5, comment: 'Excellent facilities and very clean rooms. Staff is very helpful and the location is perfect for students.', date: '2 days ago', avatar: 'RK' },
            { name: 'Priya Singh', rating: 4, comment: 'Good location and affordable pricing. Food quality is decent and the hostel maintains good hygiene standards.', date: '1 week ago', avatar: 'PS' },
            { name: 'Amit Sharma', rating: 5, comment: 'Best hostel in the area. Highly recommend for students. Great amenities and friendly environment.', date: '2 weeks ago', avatar: 'AS' }
          ],
          roomTypes: [
            { name: 'Single', description: 'Private room with attached bathroom' },
            { name: 'Double', description: 'Shared room with common facilities' }
          ],
          capacity: '50+ Students',
          checkIn: 'Flexible timing',
          rating: 4.7,
          contactInfo: {
            phone: '+91 98765 43210',
            email: 'alpha@kaunsahostel.com',
            address: 'Knowledge Park III, Greater Noida, UP 201310'
          }
        },
        {
          name: 'Professional\'s Hub',
          description: 'Perfect for working professionals. Single & double sharing rooms with AC, attached bath, and parking.',
          location: 'Near Pari Chowk, Greater Noida',
          price: 10000,
          amenities: ['AC Rooms', 'Attached Bath', 'Parking', 'WiFi', 'Meals'],
          availability: 'Limited',
          info: [
            { title: 'Security Deposit', value: '₹15,000' },
            { title: 'Available Rooms', value: '3' },
            { title: 'Parking', value: 'Available' },
            { title: 'Notice Period', value: '1 Month' }
          ],
          rating: 4.5,
          contactInfo: {
            phone: '+91 98765 43211',
            email: 'professional@kaunsahostel.com',
            address: 'Near Pari Chowk, Greater Noida, UP 201310'
          }
        },
        {
          name: 'Gamer\'s Paradise PG',
          description: 'For the tech-savvy! Blazing fast internet, dedicated gaming zone, and close to IT parks.',
          location: 'Techzone IV, Greater Noida',
          price: 9500,
          amenities: ['Gaming Zone', 'High-Speed Internet', 'AC Rooms', 'Security', 'Meals'],
          availability: 'Available',
          info: [
            { title: 'Security Deposit', value: '₹12,000' },
            { title: 'Available Rooms', value: '8' },
            { title: 'Internet Speed', value: '100 Mbps' },
            { title: 'Gaming Hours', value: '24/7' }
          ],
          rating: 4.8,
          contactInfo: {
            phone: '+91 98765 43212',
            email: 'gamers@kaunsahostel.com',
            address: 'Techzone IV, Greater Noida, UP 201310'
          }
        },
        {
          name: 'Secure Haven (Girls)',
          description: 'A safe and comfortable girls-only hostel with a female warden, CCTV, and biometric entry.',
          location: 'Omega I, Greater Noida',
          price: 9000,
          amenities: ['Girls Only', 'Female Warden', 'CCTV', 'Biometric Entry', 'WiFi', 'Meals'],
          availability: 'Limited',
          info: [
            { title: 'Security Deposit', value: '₹11,000' },
            { title: 'Available Rooms', value: '2' },
            { title: 'Gender', value: 'Girls Only' },
            { title: 'Curfew Time', value: '10:00 PM' }
          ],
          rating: 4.6,
          contactInfo: {
            phone: '+91 98765 43213',
            email: 'secure@kaunsahostel.com',
            address: 'Omega I, Greater Noida, UP 201310'
          }
        },
        {
          name: 'Smart Saver\'s Stay',
          description: 'The most affordable option without compromising on essential services. Perfect for budget-conscious residents.',
          location: 'Gamma II, Greater Noida',
          price: 7000,
          amenities: ['Budget Friendly', 'WiFi', 'Meals', 'Security', 'Laundry'],
          availability: 'Available',
          info: [
            { title: 'Security Deposit', value: '₹8,000' },
            { title: 'Available Rooms', value: '15' },
            { title: 'Sharing', value: 'Triple, Quad' },
            { title: 'Meal Plan', value: '2 Meals' }
          ],
          rating: 4.2,
          contactInfo: {
            phone: '+91 98765 43214',
            email: 'budget@kaunsahostel.com',
            address: 'Gamma II, Greater Noida, UP 201310'
          }
        },
        {
          name: 'The Executive Suite',
          description: 'Premium living with top-tier amenities including a mini-fridge, smart TV, and daily housekeeping.',
          location: 'Near Wipro, Greater Noida',
          price: 15000,
          amenities: ['Premium Rooms', 'Mini Fridge', 'Smart TV', 'Daily Housekeeping', 'AC', 'WiFi'],
          availability: 'Available',
          info: [
            { title: 'Security Deposit', value: '₹25,000' },
            { title: 'Available Rooms', value: '5' },
            { title: 'Room Type', value: 'Single Only' },
            { title: 'Housekeeping', value: 'Daily' },
            { title: 'Maintenance', value: 'Included' }
          ],
          rating: 4.9,
          contactInfo: {
            phone: '+91 98765 43215',
            email: 'executive@kaunsahostel.com',
            address: 'Near Wipro, Greater Noida, UP 201310'
          }
        }
      ];

      await Hostel.insertMany(hostels);
      console.log('Sample hostels created');
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();