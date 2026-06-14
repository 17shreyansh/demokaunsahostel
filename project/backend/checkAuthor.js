const mongoose = require('mongoose');
const { Author } = require('./models/BlogModels');
require('dotenv').config();

async function checkAndCreateAuthor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB');

    const existingAuthor = await Author.findOne();
    
    if (existingAuthor) {
      console.log('✅ Author already exists:');
      console.log('ID:', existingAuthor._id);
      console.log('Name:', existingAuthor.name);
      console.log('Email:', existingAuthor.email);
      console.log('\nUse this author ID when creating blogs!');
    } else {
      console.log('No author found. Creating default author...');
      
      const author = new Author({
        name: 'Admin Writer',
        slug: 'admin-writer',
        email: 'admin@kaunsacollege.com',
        bio: 'Content writer and editor',
        role: 'admin',
        isActive: true,
        postCount: 0,
        totalViews: 0
      });

      await author.save();
      console.log('✅ Author created successfully!');
      console.log('ID:', author._id);
      console.log('Name:', author.name);
      console.log('Email:', author.email);
      console.log('\nUse this author ID when creating blogs!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndCreateAuthor();
