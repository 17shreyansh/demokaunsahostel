const mongoose = require('mongoose');
require('dotenv').config();

const authorSchema = new mongoose.Schema({
  name: String,
  slug: String,
  email: String,
  bio: String,
  avatar: { url: String, alt: String },
  social: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  role: String,
  isActive: Boolean,
  postCount: Number,
  totalViews: Number,
  adminId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Author = mongoose.model('Author', authorSchema);

async function createInitialAuthor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry');
    console.log('Connected to MongoDB');

    const author = new Author({
      name: 'Admin Writer',
      slug: 'admin-writer',
      email: 'admin@example.com',
      bio: 'Content writer and editor',
      role: 'admin',
      isActive: true,
      postCount: 0,
      totalViews: 0
    });

    await author.save();
    console.log('Initial author created:', author);
    console.log('Author ID:', author._id);
    console.log('Save this ID in your .env as DEFAULT_AUTHOR_ID');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createInitialAuthor();
