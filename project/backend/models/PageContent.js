const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ['home', 'about', 'contact', 'hostels']
  },
  content: {
    // Home Page
    hero: {
      mainTitle: String,
      typewriterTexts: [String],
      location: String,
      description: String,
      primaryButton: {
        text: String,
        link: String
      },
      secondaryButton: {
        text: String,
        link: String
      },
      trustBadge: String,
      searchPlaceholder: String
    },
    search: {
      title: String,
      subtitle: String,
      budgetOptions: [{
        label: String,
        minPrice: Number,
        maxPrice: Number
      }],
      genderOptions: [{
        value: String,
        label: String
      }],
      universityLogos: [String]
    },
    services: {
      title: String,
      subtitle: String,
      items: [{
        title: String,
        description: String,
        icon: String
      }]
    },
    testimonials: {
      title: String,
      subtitle: String,
      items: [{
        name: String,
        role: String,
        text: String,
        rating: Number,
        image: String
      }]
    },
    // About Page
    about: {
      title: String,
      subtitle: String,
      stats: [{
        number: String,
        label: String
      }],
      story: {
        title: String,
        content: String
      },
      values: [{
        title: String,
        description: String
      }]
    },
    leadership: {
      title: String,
      subtitle: String,
      description: String,
      ceo: {
        name: String,
        position: String,
        bio: String,
        quote: String,
        experience: String,
        education: String,
        achievements: [String],
        image1: String,
        image2: String
      },
      team: [{
        name: String,
        position: String,
        bio: String,
        image: String,
        linkedin: String,
        email: String
      }]
    },
    mission: {
      title: String,
      content: String
    },
    vision: {
      title: String,
      content: String
    },
    // Contact Page
    contact: {
      title: String,
      subtitle: String,
      contactInfo: {
        phone: String,
        email: String,
        address: String
      },
      socialLinks: [{
        platform: String,
        url: String
      }]
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PageContent', pageContentSchema);