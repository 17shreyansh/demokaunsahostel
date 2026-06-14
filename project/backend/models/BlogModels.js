const mongoose = require('mongoose');

// ============= TAG MODEL =============
const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: String,
  color: {
    type: String,
    default: '#6B7280'
  },
  postCount: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String
  }
}, { timestamps: true });

tagSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Tag = mongoose.model('Tag', tagSchema);

// ============= AUTHOR MODEL =============
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    url: String,
    alt: String
  },
  
  social: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String,
    facebook: String,
    instagram: String
  },
  
  role: {
    type: String,
    enum: ['writer', 'editor', 'admin'],
    default: 'writer'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  postCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

authorSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Author = mongoose.model('Author', authorSchema);

// ============= COMMENT MODEL =============
const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  authorWebsite: String,
  authorAvatar: String,
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'spam', 'trash'],
    default: 'pending',
    index: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  moderatedAt: Date,
  
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  spamScore: {
    type: Number,
    default: 0
  },
  
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

commentSchema.index({ blog: 1, status: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent'
});

const Comment = mongoose.model('Comment', commentSchema);

// ============= MEDIA MODEL =============
const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  
  url: {
    type: String,
    required: true
  },
  thumbnail: String,
  medium: String,
  large: String,
  webp: String,
  
  width: Number,
  height: Number,
  
  alt: String,
  caption: String,
  description: String,
  credits: String,
  
  folder: {
    type: String,
    default: 'general'
  },
  tags: [String],
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  usageCount: {
    type: Number,
    default: 0
  },
  usedIn: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
}, { timestamps: true });

mediaSchema.index({ folder: 1, createdAt: -1 });
mediaSchema.index({ uploadedBy: 1 });

const Media = mongoose.model('Media', mediaSchema);

// ============= BLOG ANALYTICS MODEL =============
const blogAnalyticsSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  pageViews: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  
  averageTimeOnPage: Number,
  bounceRate: Number,
  completionRate: Number,
  
  sources: {
    direct: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    referral: { type: Number, default: 0 },
    email: { type: Number, default: 0 }
  },
  
  devices: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  
  shares: {
    facebook: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 },
    whatsapp: { type: Number, default: 0 }
  },
  
  topReferrers: [{
    url: String,
    count: Number
  }]
}, { timestamps: true });

blogAnalyticsSchema.index({ blog: 1, date: -1 });

const BlogAnalytics = mongoose.model('BlogAnalytics', blogAnalyticsSchema);

// ============= CONTENT BLOCK MODEL =============
const contentBlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['cta', 'faq', 'callout', 'newsletter', 'ad', 'custom'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

const ContentBlock = mongoose.model('ContentBlock', contentBlockSchema);

module.exports = {
  Tag,
  Author,
  Comment,
  Media,
  BlogAnalytics,
  ContentBlock
};
