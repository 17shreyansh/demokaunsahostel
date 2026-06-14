const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['draft', 'review', 'scheduled', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  publishDate: {
    type: Date,
    index: true
  },
  scheduledFor: Date,
  
  // Author & Contributors
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
    index: true
  },
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }],
  
  // Taxonomy
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  
  // Featured Image
  featuredImage: {
    url: String,
    thumbnail: String,
    medium: String,
    large: String,
    webp: String,
    alt: String,
    caption: String,
    credits: String,
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  },
  
  // SEO Fields
  seo: {
    title: {
      type: String,
      maxlength: [60, 'SEO title should not exceed 60 characters']
    },
    description: {
      type: String,
      maxlength: [160, 'SEO description should not exceed 160 characters']
    },
    keywords: [String],
    canonicalUrl: String,
    ogImage: String,
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image', 'app', 'player'],
      default: 'summary_large_image'
    },
    focusKeyword: String,
    noindex: {
      type: Boolean,
      default: false
    },
    nofollow: {
      type: Boolean,
      default: false
    }
  },
  
  // Content Metadata
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  
  // Content Flags
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  averageReadTime: Number,
  completionRate: Number, // % of people who read till end
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    content: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author'
    }
  }],
  
  // Content Blocks (for custom elements)
  customBlocks: [{
    type: {
      type: String,
      enum: ['cta', 'faq', 'callout', 'embed', 'code']
    },
    content: mongoose.Schema.Types.Mixed,
    position: Number
  }],
  
  // Related Content
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  
  // Moderation
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Metadata
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance
blogSchema.index({ status: 1, publishDate: -1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ categories: 1, status: 1 });
blogSchema.index({ isFeatured: 1, publishDate: -1 });
blogSchema.index({ isTrending: 1, views: -1 });

// Text Index for Full-Text Search
blogSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text' 
}, {
  weights: {
    title: 10,
    excerpt: 5,
    content: 1
  }
});

// Virtual for comment count
blogSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Pre-save middleware
blogSchema.pre('save', function(next) {
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate reading time (avg 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.wordCount = wordCount;
    this.readingTime = Math.ceil(wordCount / 200);
  }
  
  // Auto-generate SEO if not provided
  if (!this.seo.title) {
    this.seo.title = this.title.substring(0, 60);
  }
  if (!this.seo.description) {
    this.seo.description = this.excerpt || 
      this.content.replace(/<[^>]*>/g, '').substring(0, 160);
  }
  
  // Set publish date
  if (this.status === 'published' && !this.publishDate) {
    this.publishDate = new Date();
  }
  
  next();
});

// Static Methods
blogSchema.statics.findPublished = function(filter = {}) {
  return this.find({
    ...filter,
    status: 'published',
    publishDate: { $lte: new Date() }
  }).sort({ publishDate: -1 });
};

blogSchema.statics.findFeatured = function(limit = 5) {
  return this.findPublished({ isFeatured: true }).limit(limit);
};

blogSchema.statics.findTrending = function(limit = 10) {
  return this.findPublished({ isTrending: true })
    .sort({ views: -1 })
    .limit(limit);
};

blogSchema.statics.searchPosts = function(query, options = {}) {
  const { page = 1, limit = 10, category, tag, author } = options;
  const filter = {
    $text: { $search: query },
    status: 'published'
  };
  
  if (category) filter.categories = category;
  if (tag) filter.tags = tag;
  if (author) filter.author = author;
  
  return this.find(filter)
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Instance Methods
blogSchema.methods.incrementViews = async function(isUnique = false) {
  this.views += 1;
  if (isUnique) this.uniqueViews += 1;
  return this.save();
};

blogSchema.methods.saveVersion = function() {
  if (this.isModified('content')) {
    this.previousVersions.push({
      content: this.content,
      updatedAt: new Date(),
      updatedBy: this.lastModifiedBy
    });
    this.version += 1;
  }
};

blogSchema.methods.generateStructuredData = function() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: this.title,
    image: this.featuredImage?.url,
    datePublished: this.publishDate,
    dateModified: this.updatedAt,
    author: {
      '@type': 'Person',
      name: this.author?.name
    },
    description: this.seo.description || this.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': this.seo.canonicalUrl
    }
  };
};

module.exports = mongoose.model('Blog', blogSchema);
