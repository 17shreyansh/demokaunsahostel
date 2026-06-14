const Blog = require('../models/Blog');

class RecommendationService {
  // Get related posts using multiple algorithms
  async getRelated(blogId, limit = 6) {
    const blog = await Blog.findById(blogId)
      .populate('categories tags')
      .lean();
    
    if (!blog) return [];

    // If manually set related posts exist, use them
    if (blog.relatedPosts?.length) {
      const related = await Blog.find({
        _id: { $in: blog.relatedPosts },
        status: 'published'
      })
        .select('title slug excerpt featuredImage readingTime publishDate')
        .populate('author', 'name slug avatar')
        .limit(limit)
        .lean();
      
      if (related.length >= limit) return related;
    }

    // Otherwise, calculate related posts
    const scores = await this.calculateRelatedScores(blog);
    
    // Get top scoring posts
    const relatedIds = scores.slice(0, limit).map(s => s.blogId);
    
    const relatedPosts = await Blog.find({
      _id: { $in: relatedIds },
      status: 'published'
    })
      .select('title slug excerpt featuredImage readingTime publishDate views')
      .populate('author', 'name slug avatar')
      .populate('categories', 'name slug color')
      .lean();
    
    // Sort by score order
    const sortedPosts = relatedIds.map(id => 
      relatedPosts.find(p => p._id.toString() === id.toString())
    ).filter(Boolean);

    return sortedPosts;
  }

  // Calculate similarity scores
  async calculateRelatedScores(currentBlog) {
    const categoryIds = currentBlog.categories?.map(c => c._id) || [];
    const tagIds = currentBlog.tags?.map(t => t._id) || [];
    
    // Find potential related posts
    const candidates = await Blog.find({
      _id: { $ne: currentBlog._id },
      status: 'published',
      $or: [
        { categories: { $in: categoryIds } },
        { tags: { $in: tagIds } },
        { author: currentBlog.author }
      ]
    })
      .select('_id categories tags author views publishDate')
      .lean();

    // Score each candidate
    const scores = candidates.map(candidate => {
      let score = 0;

      // Category match (40 points)
      const matchingCategories = candidate.categories?.filter(c =>
        categoryIds.some(cc => cc.toString() === c.toString())
      ).length || 0;
      score += matchingCategories * 40;

      // Tag match (20 points per tag)
      const matchingTags = candidate.tags?.filter(t =>
        tagIds.some(tt => tt.toString() === t.toString())
      ).length || 0;
      score += matchingTags * 20;

      // Same author (15 points)
      if (candidate.author?.toString() === currentBlog.author?.toString()) {
        score += 15;
      }

      // Popularity boost (views normalized to 0-10)
      const viewsScore = Math.min(10, Math.log(candidate.views + 1));
      score += viewsScore;

      // Recency boost (newer posts get higher score)
      const daysSincePublish = (Date.now() - new Date(candidate.publishDate)) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 10 - (daysSincePublish / 30));
      score += recencyScore;

      return {
        blogId: candidate._id,
        score
      };
    });

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  // Get recommended posts for homepage/user
  async getRecommended(userId = null, limit = 10) {
    // If user exists, personalized recommendations
    if (userId) {
      return this.getPersonalizedRecommendations(userId, limit);
    }

    // Otherwise, popular + trending
    const [popular, trending] = await Promise.all([
      Blog.findPublished()
        .sort({ views: -1 })
        .limit(Math.ceil(limit / 2))
        .select('title slug excerpt featuredImage readingTime publishDate views')
        .populate('author', 'name slug avatar')
        .populate('categories', 'name slug color')
        .lean(),
      
      Blog.findPublished({ isTrending: true })
        .sort({ publishDate: -1 })
        .limit(Math.ceil(limit / 2))
        .select('title slug excerpt featuredImage readingTime publishDate views')
        .populate('author', 'name slug avatar')
        .populate('categories', 'name slug color')
        .lean()
    ]);

    // Merge and deduplicate
    const combined = [...popular, ...trending];
    const unique = Array.from(
      new Map(combined.map(post => [post._id.toString(), post])).values()
    );

    return unique.slice(0, limit);
  }

  // Personalized recommendations based on user reading history
  async getPersonalizedRecommendations(userId, limit = 10) {
    // This would require a UserActivity model to track reading history
    // For now, return popular posts
    return Blog.findPublished()
      .sort({ views: -1 })
      .limit(limit)
      .select('title slug excerpt featuredImage readingTime publishDate views')
      .populate('author', 'name slug avatar')
      .populate('categories', 'name slug color')
      .lean();
  }

  // Get posts you might like (category-based)
  async getSimilarByCategory(categoryId, excludeId, limit = 6) {
    return Blog.findPublished({
      categories: categoryId,
      _id: { $ne: excludeId }
    })
      .sort({ views: -1, publishDate: -1 })
      .limit(limit)
      .select('title slug excerpt featuredImage readingTime publishDate')
      .populate('author', 'name slug avatar')
      .lean();
  }

  // Get more from author
  async getMoreFromAuthor(authorId, excludeId, limit = 6) {
    return Blog.findPublished({
      author: authorId,
      _id: { $ne: excludeId }
    })
      .sort({ publishDate: -1 })
      .limit(limit)
      .select('title slug excerpt featuredImage readingTime publishDate views')
      .populate('categories', 'name slug color')
      .lean();
  }
}

module.exports = new RecommendationService();
