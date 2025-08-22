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
      story: {
        title: String,
        content: String
      },
      stats: [{
        number: String,
        label: String
      }],
      values: [{
        title: String,
        description: String
      }],
      mission: {
        title: String,
        content: String
      },
      vision: {
        title: String,
        content: String
      },
      cta: {
        title: String,
        subtitle: String,
        primaryButton: {
          text: String,
          link: String
        },
        secondaryButton: {
          text: String,
          link: String
        }
      }
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