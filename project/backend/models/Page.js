const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  sections: [{
    type: {
      type: String,
      required: true,
      enum: ['hero', 'search', 'services', 'testimonials', 'about', 'contact', 'featured_hostels', 'text', 'image', 'cta']
    },
    title: String,
    subtitle: String,
    content: String,
    image: String,
    buttonText: String,
    buttonLink: String,
    backgroundColor: String,
    textColor: String,
    order: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  }
}, {
  timestamps: true
});

pageSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Page', pageSchema);