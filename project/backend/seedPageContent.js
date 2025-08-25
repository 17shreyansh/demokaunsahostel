const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');
require('dotenv').config();

const seedPageContent = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB');
    
    console.log('Clearing existing page content...');
    await PageContent.deleteMany({});
    console.log('Existing content cleared');

    const pages = [
      {
        page: 'home',
        content: {
          hero: {
            mainTitle: 'Find Your Perfect',
            typewriterTexts: ['Hostel Room', 'Study Space', 'Home Away From Home', 'Comfort Zone', 'Student Community'],
            location: 'in Greater Noida',
            description: 'Find your perfect nest! Premium hostels with modern amenities, 24/7 security, high-speed WiFi, and a vibrant student community at Kaunsa Hostel.',
            primaryButton: {
              text: 'Explore Rooms',
              link: '/rooms'
            }
          },
          search: {
            title: 'Find Your Ideal Room',
            subtitle: 'Search through our premium accommodations'
          },
          services: {
            title: 'Amenities & Services',
            subtitle: 'Everything you need for comfort',
            items: [
              { title: 'High-Speed WiFi', description: '24/7 unlimited high-speed internet connectivity', icon: 'FaWifi' },
              { title: '24/7 Security', description: 'Round-the-clock security with CCTV surveillance', icon: 'FaLock' },
              { title: 'Mess Facility', description: 'Hygienic and nutritious meals prepared fresh daily', icon: 'FaUtensils' },
              { title: 'Laundry Service', description: 'Professional washing and cleaning services', icon: 'FaTshirt' },
              { title: 'Air Conditioning', description: 'Climate-controlled rooms for year-round comfort', icon: 'FaSnowflake' },
              { title: 'Parking Space', description: 'Secure parking for bikes and cars', icon: 'FaCar' },
              { title: 'Fitness Center', description: 'Well-equipped gym for your fitness needs', icon: 'FaDumbbell' },
              { title: 'Study Rooms', description: 'Quiet spaces dedicated for focused studying', icon: 'FaBook' },
              { title: 'Recreation Area', description: 'Gaming zone and entertainment facilities', icon: 'FaGamepad' },
              { title: 'Common Areas', description: 'Comfortable spaces to relax and socialize', icon: 'FaCoffee' },
              { title: 'Mini Market', description: 'On-site store for daily essentials', icon: 'FaStore' },
              { title: 'Transport Service', description: 'Regular shuttle service to colleges and metro', icon: 'FaBus' }
            ]
          },
          testimonials: {
            title: 'What Our Residents Say',
            subtitle: 'We are proud to be a home away from home',
            items: [
              {
                name: 'Rahul Sharma',
                role: 'Student, AKTU',
                text: 'Amazing hostel with great facilities. The WiFi is super fast and the mess food is really good. Highly recommended!',
                rating: 5,
                image: ''
              },
              {
                name: 'Priya Singh',
                role: 'Student, Amity University',
                text: 'Safe and secure environment for girls. The staff is very helpful and the rooms are well-maintained.',
                rating: 5,
                image: ''
              },
              {
                name: 'Amit Kumar',
                role: 'Student, Bennett University',
                text: 'Great location and excellent amenities. The study rooms are perfect for exam preparation.',
                rating: 4,
                image: ''
              }
            ]
          }
        }
      },
      {
        page: 'about',
        content: {
          about: {
            title: 'About Kaunsa Hostel',
            subtitle: 'Your Home Away From Home in Greater Noida'
          },
          story: {
            title: 'Our Story',
            content: 'Founded in 2020, Kaunsa Hostel was born from the understanding that students need more than just a place to stay - they need a community, comfort, and care. Located strategically in Greater Noida, we have created a space where students can focus on their studies while enjoying a vibrant social life.'
          },
          mission: {
            title: 'Our Mission',
            content: 'To provide safe, comfortable, and affordable accommodation that enhances the student experience and fosters personal growth.'
          },
          vision: {
            title: 'Our Vision',
            content: 'To be the preferred choice for student accommodation in Greater Noida, known for our quality, care, and community spirit.'
          },
          values: {
            title: 'Our Core Values',
            items: [
              { title: 'Safety First', description: 'Your security and well-being are our top priorities', icon: 'FaLock' },
              { title: 'Comfort & Care', description: 'Creating a homely environment with personal attention', icon: 'FaHome' },
              { title: '24/7 Support', description: 'Always available to address your needs and concerns', icon: 'FaPhone' },
              { title: 'Cleanliness', description: 'Maintaining highest standards of hygiene and cleanliness', icon: 'FaShower' }
            ]
          },
          stats: {
            title: 'Our Achievements',
            items: [
              { number: '500', suffix: '+', label: 'Happy Students' },
              { number: '50', suffix: '+', label: 'Rooms Available' },
              { number: '4', suffix: '.8', label: 'Star Rating' },
              { number: '24', suffix: '/7', label: 'Support Available' }
            ]
          },
          team: {
            title: 'Meet Our Team',
            subtitle: 'Dedicated professionals committed to your comfort',
            members: [
              { name: 'Mr. Rajesh Kumar', position: 'Hostel Manager', bio: 'With 10+ years of experience in hospitality management', image: '' },
              { name: 'Ms. Sunita Devi', position: 'Mess Supervisor', bio: 'Ensures quality and hygiene in our food services', image: '' },
              { name: 'Mr. Suresh Singh', position: 'Security Head', bio: 'Maintains 24/7 security and safety protocols', image: '' }
            ]
          },
          whyChoose: {
            title: 'Why Choose Kaunsa Hostel?',
            reasons: [
              { title: 'Prime Location', description: 'Located in the heart of Greater Noida with easy access to colleges', icon: 'FaHome' },
              { title: 'Modern Infrastructure', description: 'Newly constructed building with contemporary design', icon: 'FaBed' },
              { title: 'Student Community', description: 'Vibrant community of students from various backgrounds', icon: 'FaCoffee' },
              { title: 'Affordable Pricing', description: 'Competitive rates with flexible payment options', icon: 'FaBolt' }
            ]
          }
        }
      },
      {
        page: 'contact',
        content: {
          contact: {
            title: 'Get In Touch',
            subtitle: 'Have questions? We would love to hear from you. Book a visit today!',
            contactInfo: {
              phone: '+91 9876543210',
              email: 'info@kaunsahostel.com',
              address: 'Kaunsa Hostel, Sector 10, Greater Noida, Uttar Pradesh - 201310, India'
            }
          }
        }
      }
    ];

    console.log('Inserting page content...');
    await PageContent.insertMany(pages);
    console.log('Page content seeded successfully');
    console.log('Inserted ' + pages.length + ' pages');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding page content:', error);
    process.exit(1);
  }
};

seedPageContent();