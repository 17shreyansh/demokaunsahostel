const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');

const seedAboutContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/staynest');
    
    const aboutContent = {
      page: 'about',
      content: {
        about: {
          title: 'About StayNest',
          subtitle: 'Your trusted partner in finding the perfect accommodation in Greater Noida',
          story: {
            title: 'Our Story',
            content: 'StayNest was founded with a vision to revolutionize student living in Greater Noida. We understand the challenges students face when looking for safe, comfortable, and affordable accommodation. Our mission is to provide more than just a place to stay - we create communities where students can thrive academically and personally.'
          },
          stats: [
            { number: '500+', label: 'Happy Students' },
            { number: '50+', label: 'Premium Hostels' },
            { number: '5+', label: 'Years Experience' },
            { number: '24/7', label: 'Support Available' }
          ],
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
          ],
          mission: {
            title: 'Our Mission',
            content: 'To provide safe, comfortable, and affordable accommodation solutions that enable students to focus on their education and personal growth while building lasting connections.'
          },
          vision: {
            title: 'Our Vision',
            content: 'To be the leading student accommodation provider in Greater Noida, known for quality, safety, and community building that transforms student living experiences.'
          },
          cta: {
            title: 'Ready to Find Your Perfect Stay?',
            subtitle: 'Join thousands of students who have made StayNest their home away from home. Experience the difference.',
            primaryButton: {
              text: 'Explore Hostels',
              link: '/hostels'
            },
            secondaryButton: {
              text: 'Call Now',
              link: 'tel:+919876543210'
            }
          }
        }
      }
    };

    await PageContent.findOneAndUpdate(
      { page: 'about' },
      aboutContent,
      { upsert: true, new: true }
    );

    console.log('✅ About page content seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding about content:', error);
    process.exit(1);
  }
};

seedAboutContent();