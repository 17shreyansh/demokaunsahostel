const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Hierarchical Structure
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  level: {
    type: Number,
    default: 0
  },
  path: {
    type: String, // e.g., "parent-slug/child-slug"
    index: true
  },
  
  // Display
  color: {
    type: String,
    default: '#3B82F6'
  },
  icon: String,
  image: {
    url: String,
    alt: String
  },
  
  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // Ordering
  order: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, order: 1 });

// Virtual for children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware
categorySchema.pre('save', async function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate level and path
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path}/${this.slug}` : this.slug;
    }
  } else {
    this.level = 0;
    this.path = this.slug;
  }
  
  next();
});

// Static methods
categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => String(cat.parent || null) === String(parentId))
      .map(cat => ({
        ...cat,
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree();
};

categorySchema.statics.updatePostCount = async function(categoryId) {
  const Blog = mongoose.model('Blog');
  const count = await Blog.countDocuments({
    categories: categoryId,
    status: 'published'
  });
  
  await this.findByIdAndUpdate(categoryId, { postCount: count });
};

module.exports = mongoose.model('Category', categorySchema);
