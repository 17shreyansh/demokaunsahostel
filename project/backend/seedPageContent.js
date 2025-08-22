const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');
require('dotenv').config();

const seedPageContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    
    await PageContent.deleteMany({});

    const pages = [
      {
        page: 'home',
        content: {
          hero: {
            mainTitle: 'Find Your Perfect',
            typewriterTexts: ['Premium Hostels', 'Safe Accommodations', 'Budget-Friendly PGs', 'Modern Amenities', 'Verified Properties'],
            location: 'in Greater Noida',
            description: 'Find your perfect nest! Premium hostels with modern amenities and vibrant communities. Where comfort meets convenience in Greater Noida.',
            primaryButton: {
              text: 'Explore Hostels',
              link: '/hostels'
            },
            secondaryButton: {
              text: 'Call Now',
              link: 'tel:+919876543210'
            },
            trustBadge: 'Trusted by 1200+ Students',
            searchPlaceholder: 'Search hostels, locations, colleges...'
          },
          search: {
            title: 'Search Your Ideal Hostel',
            subtitle: 'Filter by location, budget, amenities, and more to find your perfect stay',
            budgetOptions: [
              { label: 'Budget Friendly (Under ₹7K)', minPrice: 0, maxPrice: 7000 },
              { label: 'Affordable (₹7K - ₹10K)', minPrice: 7000, maxPrice: 10000 },
              { label: 'Premium (₹10K - ₹15K)', minPrice: 10000, maxPrice: 15000 },
              { label: 'Luxury (Above ₹15K)', minPrice: 15000, maxPrice: 0 }
            ],
            genderOptions: [
              { value: 'Boys', label: 'Boys Only' },
              { value: 'Girls', label: 'Girls Only' },
              { value: 'Co-ed', label: 'Co-ed' }
            ],
            universityLogos: ['Galgotias University', 'Sharda University', 'Bennett University', 'GL Bajaj Institute']
          },
          services: {
            title: 'Amenities & Services',
            subtitle: 'Everything you need for a comfortable and hassle-free stay.',
            items: [
              { title: 'High-Speed Wi-Fi', description: 'Stay connected with uninterrupted, high-speed internet for work and entertainment.', icon: 'wifi' },
              { title: 'Homely Meals', description: 'Enjoy delicious and hygienic home-style food, prepared fresh every day.', icon: 'food' },
              { title: '24/7 Security', description: 'Your safety is our priority. All our hostels are equipped with CCTV and security personnel.', icon: 'security' },
              { title: 'Housekeeping', description: 'Regular cleaning and maintenance services to ensure a tidy and pleasant living space.', icon: 'cleaning' },
              { title: 'Laundry Service', description: 'On-site washing machines and affordable laundry services to take care of your clothes.', icon: 'laundry' },
              { title: 'Power Backup', description: 'Never worry about power cuts with our reliable 24/7 power backup system.', icon: 'power' },
              { title: 'AC & Non-AC Rooms', description: 'Choose between air-conditioned and non-AC rooms based on your preference and budget.', icon: 'ac' },
              { title: 'Vibrant Community', description: 'Live with like-minded individuals and build connections in our friendly community spaces.', icon: 'community' }
            ]
          },
          testimonials: {
            title: 'What Our Residents Say',
            subtitle: 'We are proud to be a home away from home.',
            items: [
              {
                name: 'Priya Sharma',
                role: 'Student, Galgotias University',
                text: 'Finding StayNest was a lifesaver. The location is perfect for my college, and the facilities are top-notch. It truly feels like a second home.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
              },
              {
                name: 'Rohan Mehra',
                role: 'Software Engineer, Wipro',
                text: 'As a working professional, I needed a quiet and clean place. StayNest exceeded my expectations. The Wi-Fi is reliable, and the food is great.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
              }
            ]
          }
        },
        seo: {
          title: 'Premium Hostels in Greater Noida | KaunsaHostel',
          description: 'Find the best hostels and PGs in Greater Noida. Safe, affordable accommodation near universities and IT parks.',
          keywords: ['hostels greater noida', 'pg greater noida', 'student accommodation', 'hostel booking']
        }
      },
      {
        page: 'about',
        content: {
          about: {
            title: 'About StayNest',
            subtitle: 'Your trusted partner in finding the perfect accommodation in Greater Noida',
            story: {
              title: 'Our Story',
              content: 'StayNest was founded with a vision to revolutionize student living in Greater Noida. We believe that your accommodation should be more than just a place to sleep - it should be your nest, where you grow, learn, and build lifelong friendships. Our team has carefully curated a network of premium hostels that combine modern amenities with a vibrant community atmosphere.'
            },
            features: [
              { title: 'Safety First', description: 'All our partner hostels are verified for safety standards with 24/7 security and CCTV surveillance.', icon: 'shield' },
              { title: 'Affordable Pricing', description: 'We ensure transparent pricing with no hidden costs, making quality accommodation accessible to all.', icon: 'money' },
              { title: '24/7 Support', description: 'Our dedicated support team is available round the clock to assist you with any queries or concerns.', icon: 'support' }
            ],
            whyChoose: {
              title: 'Why Choose Us?',
              items: [
                'Verified Properties',
                'Transparent Pricing',
                'Quality Assurance',
                'Easy Booking Process',
                '24/7 Customer Support',
                'Multiple Location Options',
                'Flexible Terms',
                'Community Building'
              ]
            }
          }
        },
        seo: {
          title: 'About Us - StayNest | Premium Hostel Booking Platform',
          description: 'Learn about StayNest, your trusted partner for finding premium hostels and PGs in Greater Noida.',
          keywords: ['about staynest', 'hostel booking platform', 'student accommodation service']
        }
      },
      {
        page: 'contact',
        content: {
          contact: {
            title: 'Get In Touch',
            subtitle: 'Have questions? We\'d love to hear from you. Book a visit today!',
            contactInfo: {
              phone: '+91 98765 43210',
              email: 'hello@staynest.com',
              address: 'Main Office, Knowledge Park III, Greater Noida, Uttar Pradesh 201310'
            },
            socialLinks: [
              { platform: 'Facebook', url: '#' },
              { platform: 'Twitter', url: '#' },
              { platform: 'Instagram', url: '#' }
            ]
          }
        },
        seo: {
          title: 'Contact Us - StayNest | Get in Touch',
          description: 'Contact StayNest for hostel bookings, queries, and support. We\'re here to help you find your perfect accommodation.',
          keywords: ['contact staynest', 'hostel booking support', 'customer service']
        }
      }
    ];

    await PageContent.insertMany(pages);
    console.log('✅ Page content seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding page content:', error);
    process.exit(1);
  }
};

seedPageContent();