const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const blogImageController = require('../controllers/blogImage.controller');
const auth = require('../middleware/auth');
const { validateBlog, validateQuery } = require('../middleware/validation');
const { rateLimitPublic, rateLimitAdmin } = require('../middleware/rateLimit');
const multer = require('multer');

// Configure multer for memory storage (Sharp will process from buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ============= PUBLIC ROUTES =============

// Get featured blogs
router.get('/featured', rateLimitPublic, blogController.getFeatured);

// Get trending blogs
router.get('/trending', rateLimitPublic, blogController.getTrending);

// Get popular blogs
router.get('/popular', rateLimitPublic, blogController.getPopular);

// Search blogs
router.get('/search', rateLimitPublic, blogController.search);

// List blogs (published only for public)
router.get('/', rateLimitPublic, blogController.list);

// Get single blog by slug
router.get('/slug/:slug', rateLimitPublic, blogController.getBySlug);

// Track engagement (public)
router.post('/track/engagement', rateLimitPublic, blogController.trackEngagement);

// Track share (public)
router.post('/track/share', rateLimitPublic, blogController.trackShare);

// ============= ADMIN ROUTES (Protected) =============

// Get blog stats
router.get('/admin/stats', auth, rateLimitAdmin, blogController.getStats);

// Create blog
router.post('/admin', auth, rateLimitAdmin, validateBlog, blogController.create);

// Update blog
router.put('/admin/:id', auth, rateLimitAdmin, validateBlog, blogController.update);

// Auto-save draft
router.patch('/admin/:id/autosave', auth, rateLimitAdmin, blogController.autoSave);

// Get blog by ID (for editing)
router.get('/admin/:id', auth, rateLimitAdmin, blogController.getById);

// Publish blog
router.post('/admin/:id/publish', auth, rateLimitAdmin, blogController.publish);

// Duplicate blog
router.post('/admin/:id/duplicate', auth, rateLimitAdmin, blogController.duplicate);

// Delete blog
router.delete('/admin/:id', auth, rateLimitAdmin, blogController.delete);

// Generate SEO preview
router.post('/admin/seo/generate', auth, rateLimitAdmin, blogController.generateSEO);

// Image upload routes
router.post('/admin/image/upload', auth, rateLimitAdmin, upload.single('image'), blogImageController.uploadFeaturedImage);
router.put('/admin/:id/image', auth, rateLimitAdmin, upload.single('image'), blogImageController.updateBlogImage);
router.delete('/admin/:id/image', auth, rateLimitAdmin, blogImageController.removeBlogImage);

module.exports = router;
