const Blog = require('../models/Blog');
const { Tag, Author, Media, BlogAnalytics } = require('../models/BlogModels');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const seoService = require('./seo.service');
const recommendationService = require('./recommendation.service');

class BlogService {
  // Create new blog post
  async create(data, adminId) {
    let author = await Author.findOne({ adminId });
    
    if (!author) {
      const Admin = mongoose.model('Admin');
      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }
      
      author = new Author({
        name: admin.username || admin.email || 'Admin',
        slug: (admin.username || admin.email || 'admin').toLowerCase().replace(/\s+/g, '-').replace(/@.*$/, ''),
        email: admin.email,
        bio: 'Content Creator',
        role: 'admin',
        isActive: true,
        postCount: 0,
        adminId: adminId
      });
      await author.save();
    }
    
    const blog = new Blog({
      ...data,
      author: author._id,
      lastModifiedBy: author._id
    });
    
    if (!data.seo?.title || !data.seo?.description) {
      blog.seo = await seoService.generateSEO(blog);
    }
    
    await blog.save();
    
    if (blog.categories?.length) {
      await Promise.all(
        blog.categories.map(catId => Category.updatePostCount(catId))
      );
    }
    
    return blog.populate(['author', 'categories', 'tags']);
  }

  // Update blog post
  async update(id, data, userId) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error('Blog not found');
    
    // Save version before update
    blog.saveVersion();
    
    // Update fields
    Object.assign(blog, data);
    blog.lastModifiedBy = userId;
    
    // Regenerate SEO if title/content changed
    if (data.title || data.content) {
      blog.seo = await seoService.generateSEO(blog);
    }
    
    await blog.save();
    
    return blog.populate(['author', 'categories', 'tags']);
  }

  // Get blog by slug
  async getBySlug(slug, incrementView = false) {
    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'name slug avatar bio social')
      .populate('categories', 'name slug color')
      .populate('tags', 'name slug color')
      .populate('commentCount');
    
    if (!blog) throw new Error('Blog not found');
    
    // Increment views non-blocking
    if (incrementView) {
      setImmediate(() => {
        blog.incrementViews(true);
      });
    }
    
    // Get related posts
    const relatedPosts = await recommendationService.getRelated(blog._id);
    
    return { blog, relatedPosts };
  }

  // List blogs with filters
  async list(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category,
      tag,
      author,
      featured,
      search,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = filters;

    const query = { status };
    
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (featured !== undefined) query.isFeatured = featured;
    if (search) {
      query.$text = { $search: search };
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name slug avatar')
        .populate('categories', 'name slug color')
        .populate('tags', 'name slug')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);

    return {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Search blogs
  async search(query, options = {}) {
    return Blog.searchPosts(query, options);
  }

  // Get featured blogs
  async getFeatured(limit = 5) {
    return Blog.findFeatured(limit)
      .populate('author', 'name slug avatar')
      .populate('categories', 'name slug color')
      .lean();
  }

  // Get trending blogs
  async getTrending(limit = 10) {
    return Blog.findTrending(limit)
      .populate('author', 'name slug avatar')
      .populate('categories', 'name slug color')
      .lean();
  }

  // Get popular blogs (by views)
  async getPopular(days = 30, limit = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Blog.findPublished({
      publishDate: { $gte: startDate }
    })
      .sort({ views: -1 })
      .limit(limit)
      .populate('author', 'name slug avatar')
      .populate('categories', 'name slug color')
      .lean();
  }

  // Publish blog
  async publish(id, userId) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error('Blog not found');

    blog.status = 'published';
    blog.publishDate = new Date();
    blog.reviewedBy = userId;
    blog.reviewedAt = new Date();
    
    await blog.save();
    
    return blog;
  }

  // Duplicate blog
  async duplicate(id, userId) {
    const original = await Blog.findById(id).lean();
    if (!original) throw new Error('Blog not found');

    delete original._id;
    delete original.slug;
    
    const duplicate = new Blog({
      ...original,
      title: `${original.title} (Copy)`,
      status: 'draft',
      author: userId,
      views: 0,
      uniqueViews: 0,
      publishDate: null
    });

    await duplicate.save();
    return duplicate;
  }

  // Soft delete
  async delete(id, userId) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error('Blog not found');

    blog.status = 'archived';
    blog.deletedAt = new Date();
    blog.deletedBy = userId;
    
    await blog.save();
    
    return blog;
  }

  // Get blog stats
  async getStats() {
    const [total, published, drafts, scheduled, totalViews, avgReadTime] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments({ status: 'scheduled' }),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, avg: { $avg: '$readingTime' } } }
      ])
    ]);

    return {
      total,
      published,
      drafts,
      scheduled,
      totalViews: totalViews[0]?.total || 0,
      avgReadTime: Math.round(avgReadTime[0]?.avg || 0)
    };
  }
}

module.exports = new BlogService();
