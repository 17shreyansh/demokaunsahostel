const express = require('express');
const Category = require('../models/Category');
const { Tag, Author, Comment, Media } = require('../models/BlogModels');
const { analyticsService, mediaService } = require('../services/analytics.service');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// ============= CATEGORY ROUTES =============
const categoryRouter = express.Router();

// Public
categoryRouter.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('-__v');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

categoryRouter.get('/tree', async (req, res) => {
  try {
    const tree = await Category.getTree();
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

categoryRouter.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin
categoryRouter.post('/admin', auth, async (req, res) => {
  try {
    const { name, description, color, parent } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    
    const category = new Category({
      name,
      description: description || '',
      color: color || '#3B82F6',
      parent: parent || null,
      isActive: true
    });
    
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

categoryRouter.put('/admin/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

categoryRouter.delete('/admin/:id', auth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============= TAG ROUTES =============
const tagRouter = express.Router();

tagRouter.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ postCount: -1, name: 1 });
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

tagRouter.get('/popular', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ postCount: -1 }).limit(20);
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

tagRouter.post('/admin', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tag name is required' });
    }
    
    const tag = new Tag({
      name,
      description: description || '',
      color: color || '#6B7280'
    });
    
    await tag.save();
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    console.error('Tag creation error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

tagRouter.put('/admin/:id', auth, async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

tagRouter.delete('/admin/:id', auth, async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============= AUTHOR ROUTES =============
const authorRouter = express.Router();

authorRouter.get('/', async (req, res) => {
  try {
    const authors = await Author.find({ isActive: true })
      .select('-email -adminId')
      .sort({ postCount: -1 });
    res.json({ success: true, data: authors });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authorRouter.get('/:slug', async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug, isActive: true })
      .select('-email -adminId');
    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }
    res.json({ success: true, data: author });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authorRouter.post('/admin', auth, async (req, res) => {
  try {
    const author = new Author({ ...req.body, adminId: req.user._id });
    await author.save();
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authorRouter.put('/admin/:id', auth, async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: author });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============= COMMENT ROUTES =============
const commentRouter = express.Router();

// Get comments for a blog
commentRouter.get('/blog/:blogId', async (req, res) => {
  try {
    const { status = 'approved' } = req.query;
    const comments = await Comment.find({
      blog: req.params.blogId,
      status,
      parent: null
    })
      .populate('replies')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Post comment
commentRouter.post('/', async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'pending' // Requires moderation
    });
    await comment.save();
    res.status(201).json({ success: true, data: comment, message: 'Comment submitted for moderation' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Get all comments
commentRouter.get('/admin', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    
    const comments = await Comment.find(query)
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Comment.countDocuments(query);
    
    res.json({
      success: true,
      data: comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Moderate comment
commentRouter.patch('/admin/:id/moderate', auth, async (req, res) => {
  try {
    const { status } = req.body; // approved, spam, trash
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderatedBy: req.user._id,
        moderatedAt: new Date()
      },
      { new: true }
    );
    res.json({ success: true, data: comment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin: Delete comment
commentRouter.delete('/admin/:id', auth, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============= MEDIA ROUTES =============
const mediaRouter = express.Router();

// Get media library
mediaRouter.get('/', auth, async (req, res) => {
  try {
    const { folder, page = 1, limit = 20 } = req.query;
    const query = folder ? { folder } : {};
    
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Media.countDocuments(query);
    
    res.json({
      success: true,
      data: media,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload media
mediaRouter.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Process image
    const processedImage = await mediaService.processImage(req.file, req.body);
    
    // Save to database
    const media = new Media({
      ...processedImage,
      folder: req.body.folder || 'general',
      uploadedBy: req.user._id
    });
    
    await media.save();
    
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update media metadata
mediaRouter.put('/:id', auth, async (req, res) => {
  try {
    const { alt, caption, description, credits, folder } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { alt, caption, description, credits, folder },
      { new: true }
    );
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete media
mediaRouter.delete('/:id', auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    
    // Delete files
    await mediaService.deleteImage(media.filename);
    
    // Delete from database
    await media.deleteOne();
    
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============= ANALYTICS ROUTES =============
const analyticsRouter = express.Router();

// Get blog analytics
analyticsRouter.get('/blog/:blogId', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await analyticsService.getBlogAnalytics(req.params.blogId, parseInt(days));
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get dashboard stats
analyticsRouter.get('/dashboard', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await analyticsService.getDashboardStats(parseInt(days));
    const topPosts = await analyticsService.getTopPosts(10, parseInt(days));
    
    res.json({ success: true, data: { stats, topPosts } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get top posts
analyticsRouter.get('/top-posts', auth, async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const topPosts = await analyticsService.getTopPosts(parseInt(limit), parseInt(days));
    res.json({ success: true, data: topPosts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = {
  categoryRouter,
  tagRouter,
  authorRouter,
  commentRouter,
  mediaRouter,
  analyticsRouter
};
