// Fallback data for when backend is offline
export const fallbackHostels = [
  {
    _id: '1',
    name: 'StayNest Premium Hub',
    slug: 'staynest-premium-hub',
    location: 'Knowledge Park III, Greater Noida',
    price: 12000,
    images: [],
    description: 'Modern hostel with premium amenities for students and professionals. Located in the heart of Greater Noida with easy access to major colleges and IT parks.',
    amenities: ['Wi-Fi', 'AC Rooms', 'Laundry', 'Security', 'Meals', 'Power Backup', 'Housekeeping', 'Study Room'],
    availability: 'Available',
    type: 'PG',
    gender: 'Co-ed',
    rating: 4.8,
    featured: true,
    capacity: '50+ Students',
    checkIn: 'Flexible timing',
    rules: [
      'No smoking inside premises',
      'Visitors allowed till 8 PM',
      'Maintain cleanliness',
      'No loud music after 10 PM'
    ],
    nearbyPlaces: {
      educational: [
        { name: 'Galgotias University', distance: '2 km' },
        { name: 'Sharda University', distance: '3 km' },
        { name: 'Bennett University', distance: '4 km' }
      ],
      offices: [
        { name: 'TCS Noida', distance: '15 km' },
        { name: 'Wipro Greater Noida', distance: '8 km' },
        { name: 'HCL Technologies', distance: '12 km' }
      ]
    },
    info: [
      { title: 'Room Type', value: 'Single/Double' },
      { title: 'Meals', value: '3 Times' },
      { title: 'Security', value: '24/7' },
      { title: 'Wi-Fi', value: 'High Speed' }
    ],
    reviews: [
      {
        name: 'Priya Sharma',
        rating: 5,
        comment: 'Excellent facilities and very clean. The staff is helpful and food quality is great.',
        date: '2 weeks ago',
        avatar: 'PS'
      },
      {
        name: 'Rohan Kumar',
        rating: 5,
        comment: 'Perfect location for college students. Safe environment and good community.',
        date: '1 month ago',
        avatar: 'RK'
      }
    ]
  },
  {
    _id: '2',
    name: 'StayNest Elite Residency',
    slug: 'staynest-elite-residency',
    location: 'Alpha I, Greater Noida',
    price: 15000,
    images: [],
    description: 'Luxury accommodation with modern facilities and premium services. Perfect for working professionals and senior students.',
    amenities: ['Wi-Fi', 'AC Rooms', 'Gym', 'Security', 'Meals', 'Power Backup', 'Housekeeping', 'Recreation Room'],
    availability: 'Limited',
    type: 'Hostel',
    gender: 'Boys',
    rating: 4.9,
    featured: true,
    capacity: '40+ Students',
    checkIn: 'Flexible timing',
    rules: [
      'No smoking inside premises',
      'Visitors allowed till 9 PM',
      'Maintain cleanliness',
      'Gym timings: 6 AM - 10 PM'
    ],
    nearbyPlaces: {
      educational: [
        { name: 'Amity University', distance: '3 km' },
        { name: 'GNIOT', distance: '2 km' },
        { name: 'IMS Engineering College', distance: '4 km' }
      ],
      offices: [
        { name: 'Infosys Noida', distance: '18 km' },
        { name: 'Adobe Greater Noida', distance: '10 km' },
        { name: 'Samsung R&D', distance: '14 km' }
      ]
    },
    info: [
      { title: 'Room Type', value: 'Single' },
      { title: 'Meals', value: '3 Times' },
      { title: 'Security', value: '24/7' },
      { title: 'Gym', value: 'Available' }
    ],
    reviews: [
      {
        name: 'Arjun Patel',
        rating: 5,
        comment: 'Top-notch facilities and excellent management. Worth every penny!',
        date: '3 weeks ago',
        avatar: 'AP'
      }
    ]
  },
  {
    _id: '3',
    name: 'StayNest Comfort Zone',
    slug: 'staynest-comfort-zone',
    location: 'Beta I, Greater Noida',
    price: 9000,
    images: [],
    description: 'Budget-friendly accommodation with all essential amenities. Great for students looking for affordable yet comfortable stay.',
    amenities: ['Wi-Fi', 'Non-AC Rooms', 'Laundry', 'Security', 'Meals', 'Power Backup', 'Study Area'],
    availability: 'Available',
    type: 'PG',
    gender: 'Girls',
    rating: 4.6,
    featured: true,
    capacity: '60+ Students',
    checkIn: 'Flexible timing',
    rules: [
      'No smoking inside premises',
      'Visitors allowed till 7 PM',
      'Maintain cleanliness',
      'Study hours: 7 PM - 11 PM'
    ],
    nearbyPlaces: {
      educational: [
        { name: 'GL Bajaj Institute', distance: '1 km' },
        { name: 'KIET Group', distance: '3 km' },
        { name: 'Accurate Institute', distance: '2 km' }
      ],
      offices: [
        { name: 'Coforge Noida', distance: '16 km' },
        { name: 'Nagarro Greater Noida', distance: '9 km' }
      ]
    },
    info: [
      { title: 'Room Type', value: 'Double/Triple' },
      { title: 'Meals', value: '3 Times' },
      { title: 'Security', value: '24/7' },
      { title: 'Study Area', value: 'Available' }
    ],
    reviews: [
      {
        name: 'Sneha Gupta',
        rating: 5,
        comment: 'Great value for money. Clean rooms and good food quality.',
        date: '1 week ago',
        avatar: 'SG'
      }
    ]
  },
  {
    _id: '4',
    name: 'StayNest Modern Living',
    slug: 'staynest-modern-living',
    location: 'Gamma I, Greater Noida',
    price: 11000,
    images: [],
    description: 'Contemporary hostel with modern amenities and vibrant community. Perfect blend of comfort and affordability.',
    amenities: ['Wi-Fi', 'AC/Non-AC Rooms', 'Laundry', 'Security', 'Meals', 'Power Backup', 'Common Area', 'Parking'],
    availability: 'Available',
    type: 'Hostel',
    gender: 'Co-ed',
    rating: 4.7,
    featured: true,
    capacity: '45+ Students',
    checkIn: 'Flexible timing',
    rules: [
      'No smoking inside premises',
      'Visitors allowed till 8 PM',
      'Maintain cleanliness',
      'Common area closes at 11 PM'
    ],
    nearbyPlaces: {
      educational: [
        { name: 'JSS Academy', distance: '2 km' },
        { name: 'NIET', distance: '4 km' },
        { name: 'GNIOT', distance: '3 km' }
      ],
      offices: [
        { name: 'Tech Mahindra Noida', distance: '17 km' },
        { name: 'Accenture Greater Noida', distance: '11 km' }
      ]
    },
    info: [
      { title: 'Room Type', value: 'Single/Double' },
      { title: 'Meals', value: '3 Times' },
      { title: 'Security', value: '24/7' },
      { title: 'Parking', value: 'Available' }
    ],
    reviews: [
      {
        name: 'Vikash Singh',
        rating: 4,
        comment: 'Good facilities and friendly environment. Management is responsive.',
        date: '2 weeks ago',
        avatar: 'VS'
      }
    ]
  },
  {
    _id: '5',
    name: 'StayNest Executive Suites',
    slug: 'staynest-executive-suites',
    location: 'Techzone IV, Greater Noida',
    price: 18000,
    images: [],
    description: 'Premium executive accommodation for working professionals. Fully furnished with luxury amenities and services.',
    amenities: ['Wi-Fi', 'AC Rooms', 'Gym', 'Security', 'Meals', 'Power Backup', 'Housekeeping', 'Conference Room', 'Parking'],
    availability: 'Limited',
    type: 'Apartment',
    gender: 'Co-ed',
    rating: 4.9,
    featured: true,
    capacity: '30+ Professionals',
    checkIn: 'Flexible timing',
    rules: [
      'No smoking inside premises',
      'Visitors allowed till 10 PM',
      'Maintain cleanliness',
      'Conference room booking required'
    ],
    nearbyPlaces: {
      educational: [
        { name: 'Bennett University', distance: '5 km' },
        { name: 'Galgotias University', distance: '6 km' }
      ],
      offices: [
        { name: 'Microsoft Noida', distance: '12 km' },
        { name: 'Oracle Greater Noida', distance: '8 km' },
        { name: 'IBM Noida', distance: '15 km' }
      ]
    },
    info: [
      { title: 'Room Type', value: 'Single Suite' },
      { title: 'Meals', value: '3 Times' },
      { title: 'Security', value: '24/7' },
      { title: 'Conference Room', value: 'Available' }
    ],
    reviews: [
      {
        name: 'Rahul Sharma',
        rating: 5,
        comment: 'Perfect for working professionals. Excellent facilities and service.',
        date: '1 month ago',
        avatar: 'RS'
      }
    ]
  },
  {
    _id: '6',
    name: 'StayNest Student Hub',
    slug: 'staynest-student-hub',
    location: 'Knowledge Park II, Greater Noida',
    price: 8500,
    images: [],
    description: 'Student-focused accommodation with study-friendly environment and budget-friendly pricing. Great community atmosphere.',
    amenities: ['Wi-Fi', 'Non-AC Rooms', 'Laundry', 'Security', 'Meals', 'Power Backup', 'Library', 'Sports Area'],
    availability: 'Available',
    type: 'PG',
    gender: 'Boys',
    rating: 4.5,
    featured: true,
    capacity: '70+ Students',
    checkIn: 'Flexible timing',
    rules: [
      'No smoking inside premises',
      'Visitors allowed till 7 PM',
      'Maintain cleanliness',
      'Library timings: 6 AM - 11 PM'
    ],
    nearbyPlaces: {
      educational: [
        { name: 'Sharda University', distance: '1 km' },
        { name: 'Amity University', distance: '4 km' },
        { name: 'GNIOT', distance: '3 km' }
      ],
      offices: [
        { name: 'Wipro Greater Noida', distance: '7 km' },
        { name: 'HCL Technologies', distance: '10 km' }
      ]
    },
    info: [
      { title: 'Room Type', value: 'Double/Triple' },
      { title: 'Meals', value: '3 Times' },
      { title: 'Security', value: '24/7' },
      { title: 'Library', value: 'Available' }
    ],
    reviews: [
      {
        name: 'Amit Kumar',
        rating: 4,
        comment: 'Good for students. Library facility is very helpful for studies.',
        date: '3 weeks ago',
        avatar: 'AK'
      }
    ]
  }
];

export const fallbackFilterOptions = {
  locations: [
    'Knowledge Park III, Greater Noida',
    'Alpha I, Greater Noida',
    'Beta I, Greater Noida',
    'Gamma I, Greater Noida',
    'Techzone IV, Greater Noida',
    'Knowledge Park II, Greater Noida'
  ],
  roomTypes: ['Single', 'Double', 'Triple', 'Suite'],
  amenities: [
    'Wi-Fi',
    'AC Rooms',
    'Non-AC Rooms',
    'Laundry',
    'Security',
    'Meals',
    'Power Backup',
    'Housekeeping',
    'Gym',
    'Study Room',
    'Library',
    'Parking',
    'Recreation Room',
    'Conference Room',
    'Sports Area'
  ]
};

export const fallbackSearchSuggestions = [
  { id: 1, name: 'StayNest Premium Hub', type: 'hostel', location: 'Knowledge Park III' },
  { id: 2, name: 'StayNest Elite Residency', type: 'hostel', location: 'Alpha I' },
  { id: 3, name: 'Knowledge Park III', type: 'location', name: 'Knowledge Park III' },
  { id: 4, name: 'Alpha I', type: 'location', name: 'Alpha I' },
  { id: 5, name: 'Galgotias University', type: 'location', name: 'Galgotias University' },
  { id: 6, name: 'Sharda University', type: 'location', name: 'Sharda University' }
];