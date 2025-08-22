const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');

const seedContactContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    
    await PageContent.findOneAndUpdate(
      { page: 'contact' },
      {
        $set: {
          'content.contact': {
            title: 'Get In Touch',
            subtitle: 'Have questions? We\'d love to hear from you. Book a visit today!',
            contactInfo: {
              phone: '+91 98765 43210',
              email: 'hello@staynest.com',
              address: 'Main Office, Knowledge Park III, Greater Noida, Uttar Pradesh 201310'
            },
            socialLinks: [
              { platform: 'facebook', url: 'https://facebook.com/staynest' },
              { platform: 'twitter', url: 'https://twitter.com/staynest' },
              { platform: 'instagram', url: 'https://instagram.com/staynest' }
            ]
          }
        }
      },
      { upsert: true }
    );

    console.log('✅ Contact page content seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding contact content:', error);
    process.exit(1);
  }
};

seedContactContent();