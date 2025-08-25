const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');
require('dotenv').config();

const aboutPageContent = {
  page: 'about',
  content: {
    about: {
      title: 'About StayNest',
      subtitle: 'Your trusted partner in finding the perfect accommodation in Greater Noida',
      stats: [
        { number: '500+', label: 'Happy Students' },
        { number: '50+', label: 'Premium Hostels' },
        { number: '5+', label: 'Years Experience' },
        { number: '24/7', label: 'Support Available' }
      ],
      story: {
        title: 'Our Story',
        content: 'StayNest was founded with a vision to revolutionize student living in Greater Noida. We understand the challenges students face when looking for safe, comfortable, and affordable accommodation. Our mission is to provide more than just a place to stay - we create communities where students can thrive academically and personally.'
      },
      values: [
        {
          title: 'Safety First',
          description: 'Your security is our top priority with 24/7 surveillance and secure access'
        },
        {
          title: 'Quality Living',
          description: 'Premium amenities and comfortable spaces for the best student experience'
        },
        {
          title: 'Community',
          description: 'Building connections and lifelong friendships in our vibrant communities'
        },
        {
          title: 'Innovation',
          description: 'Modern solutions and smart technology for contemporary living needs'
        }
      ]
    },
    leadership: {
      title: 'Leadership Excellence',
      subtitle: 'Meet the visionary transforming student accommodation in Greater Noida',
      description: 'Our leadership team brings decades of experience in hospitality, real estate, and student services.',
      ceo: {
        name: 'Rajesh Kumar',
        position: 'CEO & Founder',
        bio: 'Rajesh Kumar is a visionary entrepreneur with over 15 years of experience in the hospitality and real estate industry. His passion for creating exceptional student living experiences has driven StayNest to become a leading accommodation provider in Greater Noida.',
        quote: 'We believe in creating spaces where students don\'t just live, but flourish. Every decision we make is centered around building communities that support academic success and personal growth.',
        experience: '15+ years in hospitality and real estate',
        education: 'MBA from IIM Delhi, B.Tech from NIT Kurukshetra',
        achievements: [
          'Founded StayNest in 2019 with a vision to transform student accommodation',
          'Successfully established 50+ premium hostels across Greater Noida',
          'Served over 2000+ students with exceptional living experiences',
          'Recognized as "Young Entrepreneur of the Year" by Greater Noida Chamber of Commerce',
          'Pioneered smart hostel technology integration in the region'
        ],
        image1: '',
        image2: ''
      },
      team: [
        {
          name: 'Priya Sharma',
          position: 'Chief Operations Officer',
          bio: 'Priya oversees all operational aspects of StayNest properties, ensuring consistent quality and service standards across all locations.',
          image: '',
          linkedin: 'https://linkedin.com/in/priyasharma',
          email: 'priya@staynest.com'
        },
        {
          name: 'Amit Singh',
          position: 'Head of Student Services',
          bio: 'Amit leads our student support team, focusing on creating engaging community programs and ensuring student satisfaction.',
          image: '',
          linkedin: 'https://linkedin.com/in/amitsingh',
          email: 'amit@staynest.com'
        },
        {
          name: 'Neha Gupta',
          position: 'Head of Technology',
          bio: 'Neha drives our technology initiatives, implementing smart solutions to enhance the student living experience.',
          image: '',
          linkedin: 'https://linkedin.com/in/nehagupta',
          email: 'neha@staynest.com'
        }
      ]
    },
    mission: {
      title: 'Our Mission',
      content: 'To provide safe, comfortable, and affordable accommodation solutions that enable students to focus on their education and personal growth while building lasting connections and memories.'
    },
    vision: {
      title: 'Our Vision',
      content: 'To be the leading student accommodation provider in Greater Noida, known for quality, safety, and community building that transforms student living experiences across India.'
    }
  },
  seo: {
    title: 'About StayNest - Leading Student Accommodation in Greater Noida',
    description: 'Learn about StayNest\'s mission to provide premium student accommodation in Greater Noida. Meet our leadership team and discover our commitment to student success.',
    keywords: ['about staynest', 'student accommodation greater noida', 'hostel management', 'student housing', 'greater noida hostels']
  }
};

async function seedAboutContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing about page content
    await PageContent.deleteOne({ page: 'about' });
    console.log('Removed existing about page content');

    // Insert new about page content
    const newContent = new PageContent(aboutPageContent);
    await newContent.save();
    console.log('About page content seeded successfully');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding about content:', error);
    process.exit(1);
  }
}

seedAboutContent();