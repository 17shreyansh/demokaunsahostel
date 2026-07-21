const { BlogAnalytics } = require('../models/BlogModels');
const Blog = require('../models/Blog');

// ============= ANALYTICS SERVICE =============
class AnalyticsService {
  // Track page view
  async trackView(blogId, data = {}) {
    const { source = 'direct', device = 'desktop', referrer, isUnique = false } = data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create analytics record for today
    let analytics = await BlogAnalytics.findOne({
      blog: blogId,
      date: today
    });

    if (!analytics) {
      analytics = new BlogAnalytics({
        blog: blogId,
        date: today
      });
    }

    // Increment views
    analytics.pageViews += 1;
    if (isUnique) analytics.uniqueVisitors += 1;

    // Track source
    const sourceKey = this.normalizeSource(source);
    if (analytics.sources[sourceKey] !== undefined) {
      analytics.sources[sourceKey] += 1;
    }

    // Track device
    const deviceKey = device.toLowerCase();
    if (analytics.devices[deviceKey] !== undefined) {
      analytics.devices[deviceKey] += 1;
    }

    // Track referrer
    if (referrer) {
      const existing = analytics.topReferrers.find(r => r.url === referrer);
      if (existing) {
        existing.count += 1;
      } else {
        analytics.topReferrers.push({ url: referrer, count: 1 });
      }
      
      // Keep only top 10
      analytics.topReferrers.sort((a, b) => b.count - a.count);
      analytics.topReferrers = analytics.topReferrers.slice(0, 10);
    }

    await analytics.save();

    // Update blog view count
    await Blog.findByIdAndUpdate(blogId, { $inc: { views: 1, uniqueViews: isUnique ? 1 : 0 } });
  }

  // Track engagement
  async trackEngagement(blogId, data = {}) {
    const { timeOnPage, completionRate } = data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await BlogAnalytics.findOne({
      blog: blogId,
      date: today
    });

    if (analytics) {
      // Update average time on page
      if (timeOnPage) {
        const currentAvg = analytics.averageTimeOnPage || 0;
        const currentCount = analytics.pageViews || 1;
        analytics.averageTimeOnPage = ((currentAvg * (currentCount - 1)) + timeOnPage) / currentCount;
      }

      // Update completion rate
      if (completionRate) {
        const currentRate = analytics.completionRate || 0;
        const currentCount = analytics.pageViews || 1;
        analytics.completionRate = ((currentRate * (currentCount - 1)) + completionRate) / currentCount;
      }

      await analytics.save();
    }
  }

  // Track social share
  async trackShare(blogId, platform) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await BlogAnalytics.findOne({
      blog: blogId,
      date: today
    });

    if (analytics) {
      const platformKey = platform.toLowerCase();
      if (analytics.shares[platformKey] !== undefined) {
        analytics.shares[platformKey] += 1;
      }
      await analytics.save();
    }

    // Update blog share count
    await Blog.findByIdAndUpdate(blogId, { $inc: { shares: 1 } });
  }

  // Get blog analytics
  async getBlogAnalytics(blogId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await BlogAnalytics.find({
      blog: blogId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Aggregate data
    const summary = {
      totalViews: 0,
      uniqueVisitors: 0,
      avgTimeOnPage: 0,
      avgCompletionRate: 0,
      sources: { direct: 0, organic: 0, social: 0, referral: 0, email: 0 },
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      shares: { facebook: 0, twitter: 0, linkedin: 0, whatsapp: 0 },
      dailyData: []
    };

    analytics.forEach(day => {
      summary.totalViews += day.pageViews;
      summary.uniqueVisitors += day.uniqueVisitors;
      
      Object.keys(day.sources.toObject()).forEach(key => {
        summary.sources[key] += day.sources[key];
      });
      
      Object.keys(day.devices.toObject()).forEach(key => {
        summary.devices[key] += day.devices[key];
      });
      
      Object.keys(day.shares.toObject()).forEach(key => {
        summary.shares[key] += day.shares[key];
      });

      summary.dailyData.push({
        date: day.date,
        views: day.pageViews,
        visitors: day.uniqueVisitors
      });
    });

    // Calculate averages
    if (analytics.length > 0) {
      summary.avgTimeOnPage = analytics.reduce((sum, d) => sum + (d.averageTimeOnPage || 0), 0) / analytics.length;
      summary.avgCompletionRate = analytics.reduce((sum, d) => sum + (d.completionRate || 0), 0) / analytics.length;
    }

    return summary;
  }

  // Get dashboard stats
  async getDashboardStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await BlogAnalytics.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$pageViews' },
          totalVisitors: { $sum: '$uniqueVisitors' },
          avgTimeOnPage: { $avg: '$averageTimeOnPage' },
          avgCompletionRate: { $avg: '$completionRate' }
        }
      }
    ]);

    return stats[0] || {
      totalViews: 0,
      totalVisitors: 0,
      avgTimeOnPage: 0,
      avgCompletionRate: 0
    };
  }

  // Get top performing posts
  async getTopPosts(limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topPosts = await BlogAnalytics.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: '$blog',
          totalViews: { $sum: '$pageViews' },
          uniqueVisitors: { $sum: '$uniqueVisitors' }
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: limit }
    ]);

    // Populate blog data
    const blogIds = topPosts.map(p => p._id);
    const blogs = await Blog.find({ _id: { $in: blogIds } })
      .select('title slug featuredImage')
      .lean();

    return topPosts.map(post => ({
      ...post,
      blog: blogs.find(b => b._id.toString() === post._id.toString())
    }));
  }

  // Normalize traffic source
  normalizeSource(source) {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('google') || lowerSource.includes('bing') || lowerSource.includes('search')) {
      return 'organic';
    }
    if (lowerSource.includes('facebook') || lowerSource.includes('twitter') || lowerSource.includes('linkedin')) {
      return 'social';
    }
    if (lowerSource.includes('email') || lowerSource.includes('newsletter')) {
      return 'email';
    }
    if (lowerSource === 'direct' || lowerSource === '') {
      return 'direct';
    }
    return 'referral';
  }
}

// ============= MEDIA SERVICE =============
const sharp = require('sharp'); // For image processing (install: sharp)
const path = require('path');
const fs = require('fs').promises;
const { applyWatermark } = require('../utils/watermark');

class MediaService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 600, height: 400 },
      large: { width: 1200, height: 800 }
    };
  }

  // Process uploaded image
  async processImage(file, options = {}) {
    const { filename, originalname, mimetype, size, buffer } = file;
    const { alt = '', caption = '', credits = '' } = options;

    // Generate versions
    const versions = await this.generateVersions(buffer, filename);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    return {
      filename,
      originalName: originalname,
      mimeType: mimetype,
      size,
      url: `/uploads/${filename}`,
      thumbnail: versions.thumbnail,
      medium: versions.medium,
      large: versions.large,
      webp: versions.webp,
      width: metadata.width,
      height: metadata.height,
      alt,
      caption,
      credits
    };
  }

  // Generate multiple sizes and WebP version
  async generateVersions(buffer, originalFilename) {
    const baseName = path.parse(originalFilename).name;
    const versions = {};

    try {
      // Thumbnail
      const thumbnailFilename = `${baseName}-thumb.jpg`;
      let thumbStream = sharp(buffer).resize(this.sizes.thumbnail.width, this.sizes.thumbnail.height, { fit: 'cover' });
      thumbStream = await applyWatermark(thumbStream, this.sizes.thumbnail.width);
      await thumbStream
        .jpeg({ quality: 80 })
        .toFile(path.join(this.uploadDir, thumbnailFilename));
      versions.thumbnail = `/uploads/${thumbnailFilename}`;

      // Medium
      const mediumFilename = `${baseName}-medium.jpg`;
      let mediumStream = sharp(buffer).resize(this.sizes.medium.width, this.sizes.medium.height, { fit: 'inside' });
      mediumStream = await applyWatermark(mediumStream, this.sizes.medium.width);
      await mediumStream
        .jpeg({ quality: 85 })
        .toFile(path.join(this.uploadDir, mediumFilename));
      versions.medium = `/uploads/${mediumFilename}`;

      // Large
      const largeFilename = `${baseName}-large.jpg`;
      let largeStream = sharp(buffer).resize(this.sizes.large.width, this.sizes.large.height, { fit: 'inside' });
      largeStream = await applyWatermark(largeStream, this.sizes.large.width);
      await largeStream
        .jpeg({ quality: 90 })
        .toFile(path.join(this.uploadDir, largeFilename));
      versions.large = `/uploads/${largeFilename}`;

      // WebP version (best compression)
      const webpFilename = `${baseName}.webp`;
      let webpStream = sharp(buffer).resize(this.sizes.large.width, this.sizes.large.height, { fit: 'inside' });
      webpStream = await applyWatermark(webpStream, this.sizes.large.width);
      await webpStream
        .webp({ quality: 85 })
        .toFile(path.join(this.uploadDir, webpFilename));
      versions.webp = `/uploads/${webpFilename}`;

    } catch (error) {
      console.error('Error generating image versions:', error);
    }

    return versions;
  }

  // Optimize existing image
  async optimizeImage(filepath) {
    try {
      const buffer = await fs.readFile(filepath);
      let optimizedStream = sharp(buffer).jpeg({ quality: 80 });
      // Watermark optimization path (uses original metadata width if possible, but hard to know here, so we assume 800)
      optimizedStream = await applyWatermark(optimizedStream, 800);
      const optimized = await optimizedStream.toBuffer();
      await fs.writeFile(filepath, optimized);
      return true;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return false;
    }
  }

  // Delete image and all versions
  async deleteImage(filename) {
    const baseName = path.parse(filename).name;
    const versions = [
      filename,
      `${baseName}-thumb.jpg`,
      `${baseName}-medium.jpg`,
      `${baseName}-large.jpg`,
      `${baseName}.webp`
    ];

    for (const version of versions) {
      try {
        await fs.unlink(path.join(this.uploadDir, version));
      } catch (error) {
        // File might not exist, ignore error
      }
    }
  }
}

module.exports = {
  analyticsService: new AnalyticsService(),
  mediaService: new MediaService()
};
