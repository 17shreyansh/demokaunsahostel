const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const Hostel = require('./models/Hostel');
const Enquiry = require('./models/Enquiry');
const Lead = require('./models/Lead');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    
    // Clear existing data
    await Admin.deleteMany({});
    await Hostel.deleteMany({});
    await Enquiry.deleteMany({});
    await Lead.deleteMany({});

    // Create admin users
    const admins = await Admin.insertMany([
      {
        username: 'admin',
        email: 'admin@kaunsahostel.com',
        password: 'admin123'
      },
      {
        username: 'manager',
        email: 'manager@kaunsahostel.com',
        password: 'manager123'
      }
    ]);

    // Create hostels
    const hostels = await Hostel.insertMany([
      {
        name: 'Alpha Student Abode',
        description: 'Ideal for students of nearby universities. Includes high-speed Wi-Fi, 3 meals, and 24/7 security.',
        location: 'Knowledge Park III, Greater Noida',
        price: 8500,
        images: ['hostel1.jpg', 'hostel1-2.jpg'],
        amenities: ['High-Speed WiFi', '3 Meals Daily', '24/7 Security', 'AC Rooms', 'Laundry Service'],
        roomTypes: [
          { type: 'Single', price: 10000, available: 5 },
          { type: 'Double', price: 8500, available: 8 }
        ],
        contactInfo: {
          phone: '+91 98765 43210',
          email: 'alpha@kaunsahostel.com',
          address: 'Knowledge Park III, Greater Noida, UP 201310'
        },
        availability: 'Available',
        featured: true,
        rating: 4.7,
        info: [
          { title: 'Security Deposit', value: '₹10,000' },
          { title: 'Available Rooms', value: '13' }
        ],
        rules: ['No smoking', 'Visitors till 8 PM', 'No loud music after 10 PM'],
        type: 'PG',
        gender: 'Co-ed',
        securityDeposit: 10000,
        availableRooms: 13,
        nearbyPlaces: {
          educational: [
            { name: 'Galgotias University', distance: '2 km' },
            { name: 'Sharda University', distance: '3 km' }
          ],
          offices: [
            { name: 'Wipro', distance: '4 km' },
            { name: 'TCS', distance: '5 km' }
          ]
        },
        reviews: [
          { name: 'Rahul Kumar', rating: 5, comment: 'Excellent facilities and very clean rooms.', date: '2 days ago', avatar: 'RK' },
          { name: 'Priya Singh', rating: 4, comment: 'Good location and affordable pricing.', date: '1 week ago', avatar: 'PS' }
        ]
      },
      {
        name: 'Professional Hub',
        description: 'Perfect for working professionals. Single & double sharing rooms with AC, attached bath, and parking.',
        location: 'Near Pari Chowk, Greater Noida',
        price: 10000,
        images: ['hostel2.jpg'],
        amenities: ['AC Rooms', 'Attached Bath', 'Parking', 'WiFi', 'Meals'],
        roomTypes: [
          { type: 'Single', price: 12000, available: 2 },
          { type: 'Double', price: 10000, available: 1 }
        ],
        contactInfo: {
          phone: '+91 98765 43211',
          email: 'professional@kaunsahostel.com',
          address: 'Near Pari Chowk, Greater Noida, UP 201310'
        },
        availability: 'Limited',
        featured: false,
        rating: 4.5,
        info: [
          { title: 'Security Deposit', value: '₹15,000' },
          { title: 'Available Rooms', value: '3' }
        ],
        rules: ['Professional environment', 'No parties'],
        type: 'PG',
        gender: 'Co-ed',
        securityDeposit: 15000,
        availableRooms: 3
      },
      {
        name: 'Secure Haven Girls',
        description: 'A safe and comfortable girls-only hostel with female warden, CCTV, and biometric entry.',
        location: 'Omega I, Greater Noida',
        price: 9000,
        images: ['hostel3.jpg'],
        amenities: ['Girls Only', 'Female Warden', 'CCTV', 'Biometric Entry', 'WiFi', 'Meals'],
        roomTypes: [
          { type: 'Single', price: 11000, available: 1 },
          { type: 'Double', price: 9000, available: 1 }
        ],
        contactInfo: {
          phone: '+91 98765 43213',
          email: 'secure@kaunsahostel.com',
          address: 'Omega I, Greater Noida, UP 201310'
        },
        availability: 'Limited',
        featured: true,
        rating: 4.6,
        info: [
          { title: 'Security Deposit', value: '₹11,000' },
          { title: 'Gender', value: 'Girls Only' }
        ],
        rules: ['Curfew 10 PM', 'No male visitors'],
        type: 'Hostel',
        gender: 'Girls',
        securityDeposit: 11000,
        availableRooms: 2
      },
      {
        name: 'Budget Friendly Stay',
        description: 'Most affordable option without compromising essential services. Perfect for budget-conscious residents.',
        location: 'Gamma II, Greater Noida',
        price: 7000,
        images: ['hostel4.jpg'],
        amenities: ['Budget Friendly', 'WiFi', 'Meals', 'Security', 'Laundry'],
        roomTypes: [
          { type: 'Triple', price: 7000, available: 10 },
          { type: 'Quad', price: 6000, available: 5 }
        ],
        contactInfo: {
          phone: '+91 98765 43214',
          email: 'budget@kaunsahostel.com',
          address: 'Gamma II, Greater Noida, UP 201310'
        },
        availability: 'Available',
        featured: false,
        rating: 4.2,
        info: [
          { title: 'Security Deposit', value: '₹8,000' },
          { title: 'Meal Plan', value: '2 Meals' }
        ],
        rules: ['Maintain cleanliness', 'No loud music'],
        type: 'PG',
        gender: 'Co-ed',
        securityDeposit: 8000,
        availableRooms: 15
      },
      {
        name: 'Executive Suite',
        description: 'Premium living with top-tier amenities including mini-fridge, smart TV, and daily housekeeping.',
        location: 'Near Wipro, Greater Noida',
        price: 15000,
        images: ['hostel5.jpg', 'hostel5-2.jpg'],
        amenities: ['Premium Rooms', 'Mini Fridge', 'Smart TV', 'Daily Housekeeping', 'AC', 'WiFi'],
        roomTypes: [
          { type: 'Single Premium', price: 15000, available: 5 }
        ],
        contactInfo: {
          phone: '+91 98765 43215',
          email: 'executive@kaunsahostel.com',
          address: 'Near Wipro, Greater Noida, UP 201310'
        },
        availability: 'Available',
        featured: true,
        rating: 4.9,
        info: [
          { title: 'Security Deposit', value: '₹25,000' },
          { title: 'Housekeeping', value: 'Daily' }
        ],
        rules: ['Premium service standards', 'Quiet hours 10 PM - 7 AM'],
        type: 'Premium PG',
        gender: 'Co-ed',
        securityDeposit: 25000,
        availableRooms: 5
      }
    ]);

    // Create enquiries
    await Enquiry.insertMany([
      {
        hostelId: hostels[0]._id,
        name: 'Amit Sharma',
        email: 'amit.sharma@email.com',
        phone: '+91 9876543210',
        message: 'Looking for a single room for 6 months. When can I visit?',
        checkInDate: new Date('2024-02-15'),
        roomType: 'Single',
        userType: 'Student',
        institution: 'Galgotias University',
        course: 'B.Tech CSE',
        address: 'Delhi',
        budget: '8000-10000',
        hostelName: 'Alpha Student Abode',
        status: 'Pending'
      },
      {
        hostelId: hostels[1]._id,
        name: 'Priya Gupta',
        email: 'priya.gupta@email.com',
        phone: '+91 9876543211',
        message: 'Need accommodation for working professional. Is parking available?',
        checkInDate: new Date('2024-02-20'),
        roomType: 'Single',
        userType: 'Professional',
        institution: 'TCS',
        budget: '10000-12000',
        hostelName: 'Professional Hub',
        status: 'Contacted'
      },
      {
        hostelId: hostels[2]._id,
        name: 'Sneha Patel',
        email: 'sneha.patel@email.com',
        phone: '+91 9876543212',
        message: 'Looking for girls hostel with good security. Can I get a room tour?',
        checkInDate: new Date('2024-03-01'),
        roomType: 'Double',
        userType: 'Student',
        institution: 'Sharda University',
        course: 'MBA',
        budget: '8000-10000',
        hostelName: 'Secure Haven Girls',
        status: 'Resolved'
      }
    ]);

    // Create leads
    await Lead.insertMany([
      {
        type: 'enquiry',
        name: 'Rohit Kumar',
        email: 'rohit.kumar@email.com',
        phone: '+91 9876543213',
        message: 'Interested in budget accommodation near university',
        hostelId: hostels[3]._id,
        hostelName: 'Budget Friendly Stay',
        checkInDate: new Date('2024-02-25'),
        roomType: 'Triple',
        userType: 'Student',
        institution: 'AKTU',
        course: 'B.Tech',
        budget: '6000-8000',
        status: 'New',
        priority: 'High',
        assignedTo: admins[0]._id
      },
      {
        type: 'enquiry',
        name: 'Kavya Singh',
        email: 'kavya.singh@email.com',
        phone: '+91 9876543214',
        message: 'Looking for premium accommodation with all facilities',
        hostelId: hostels[4]._id,
        hostelName: 'Executive Suite',
        checkInDate: new Date('2024-03-10'),
        roomType: 'Single Premium',
        userType: 'Professional',
        institution: 'Wipro',
        budget: '15000+',
        status: 'Qualified',
        priority: 'High',
        assignedTo: admins[1]._id,
        notes: [
          { text: 'Very interested in premium facilities', addedBy: 'Manager', addedAt: new Date() }
        ],
        followUpDate: new Date('2024-01-25')
      },
      {
        type: 'contact',
        name: 'Rajesh Verma',
        email: 'rajesh.verma@email.com',
        phone: '+91 9876543215',
        message: 'Want to list my hostel on your platform',
        subject: 'Hostel Listing Inquiry',
        company: 'Verma Properties',
        status: 'Contacted',
        priority: 'Medium',
        assignedTo: admins[0]._id
      },
      {
        type: 'contact',
        name: 'Anita Joshi',
        email: 'anita.joshi@email.com',
        phone: '+91 9876543216',
        message: 'Bulk booking inquiry for corporate employees',
        subject: 'Corporate Booking',
        company: 'Tech Solutions Pvt Ltd',
        status: 'New',
        priority: 'High'
      }
    ]);

    console.log('✅ Database seeded successfully with:');
    console.log(`- ${admins.length} admin users`);
    console.log(`- ${hostels.length} hostels`);
    console.log('- 3 enquiries');
    console.log('- 4 leads');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();