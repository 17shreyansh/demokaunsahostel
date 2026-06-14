const blogService = require('../services/blog.service');
const seoService = require('../services/seo.service');
const { analyticsService } = require('../services/analytics.service');
const Blog = require('../models/Blog');

class BlogController {
  // Create new blog
  async create(req, res) {
    try {
      const adminId = req.user._id;
      const blog = await blogService.create(req.body, adminId);
      res.status(201).json({ success: true, data: blog });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Update blog
  async update(req, res) {
    try {
      const blog = await blogService.update(req.params.id, req.body, req.user._id);
      res.json({ success: true, data: blog });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get single blog by slug (public)
  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const { blog, relatedPosts } = await blogService.getBySlug(slug, true);
      
      // Generate structured data
      const structuredData = seoService.generateStructuredData(blog);
      const breadcrumbSchema = seoService.generateBreadcrumbSchema(blog);
      
      // Track view (non-blocking)
      setImmediate(() => {
        analyticsService.trackView(blog._id, {
          source: req.query.utm_source || req.get('referer') || 'direct',
          device: req.useragent?.isMobile ? 'mobile' : req.useragent?.isTablet ? 'tablet' : 'desktop',
          referrer: req.get('referer'),
          isUnique: true // Should check cookie/session
        });
      });

      res.json({
        success: true,
        data: {
          blog,
          relatedPosts,
          structuredData: [structuredData, breadcrumbSchema]
        }
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Get blog by ID (admin)
  async getById(req, res) {
    try {
      const blog = await Blog.findById(req.params.id)
        .populate('author categories tags');
      
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }

      // Calculate SEO score
      const seoScore = seoService.calculateSEOScore(blog);

      res.json({ success: true, data: { blog, seoScore } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // List blogs with filters
  async list(req, res) {
    try {
      const result = await blogService.list(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Search blogs
  async search(req, res) {
    try {
      const { q, page = 1, limit = 10, category, tag, author } = req.query;
      
      if (!q) {
        return res.status(400).json({ success: false, message: 'Search query required' });
      }

      const results = await blogService.search(q, { page, limit, category, tag, author });
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get featured blogs
  async getFeatured(req, res) {
    try {
      const { limit = 5 } = req.query;
      const blogs = await blogService.getFeatured(parseInt(limit));
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get trending blogs
  async getTrending(req, res) {
    try {
      const { limit = 10 } = req.query;
      const blogs = await blogService.getTrending(parseInt(limit));
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get popular blogs
  async getPopular(req, res) {
    try {
      const { days = 30, limit = 10 } = req.query;
      const blogs = await blogService.getPopular(parseInt(days), parseInt(limit));
      res.json({ success: true, data: blogs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Publish blog
  async publish(req, res) {
    try {
      const blog = await blogService.publish(req.params.id, req.user._id);
      res.json({ success: true, data: blog, message: 'Blog published successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Duplicate blog
  async duplicate(req, res) {
    try {
      const blog = await blogService.duplicate(req.params.id, req.user._id);
      res.json({ success: true, data: blog, message: 'Blog duplicated successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete blog (soft delete)
  async delete(req, res) {
    try {
      await blogService.delete(req.params.id, req.user._id);
      res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get stats
  async getStats(req, res) {
    try {
      const stats = await blogService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Auto-save draft
  async autoSave(req, res) {
    try {
      const { id } = req.params;
      const { content, title } = req.body;
      
      const blog = await Blog.findByIdAndUpdate(
        id,
        { 
          content, 
          title,
          lastModifiedBy: req.user._id 
        },
        { new: true }
      );

      res.json({ success: true, data: blog, message: 'Auto-saved' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Generate SEO preview
  async generateSEO(req, res) {
    try {
      const { title, content, excerpt } = req.body;
      const mockBlog = { title, content, excerpt, slug: 'preview' };
      
      const seo = await seoService.generateSEO(mockBlog);
      const seoScore = seoService.calculateSEOScore({ ...mockBlog, seo });
      
      res.json({ success: true, data: { seo, seoScore } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Track engagement
  async trackEngagement(req, res) {
    try {
      const { blogId, timeOnPage, completionRate } = req.body;
      
      await analyticsService.trackEngagement(blogId, {
        timeOnPage,
        completionRate
      });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Track share
  async trackShare(req, res) {
    try {
      const { blogId, platform } = req.body;
      await analyticsService.trackShare(blogId, platform);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BlogController();
