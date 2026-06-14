const natural = require('natural'); // For keyword extraction (install: natural)

class SEOService {
  // Generate complete SEO metadata
  async generateSEO(blog) {
    const { title, content, excerpt } = blog;
    
    // Generate SEO title (max 60 chars)
    const seoTitle = this.generateTitle(title);
    
    // Generate meta description (max 160 chars)
    const seoDescription = this.generateDescription(excerpt, content);
    
    // Extract keywords
    const keywords = this.extractKeywords(title, content);
    
    // Get focus keyword (most important)
    const focusKeyword = keywords[0] || '';
    
    // Generate canonical URL
    const canonicalUrl = `${process.env.FRONTEND_URL}/blog/${blog.slug}`;
    
    // Default OG image
    const ogImage = blog.featuredImage?.url || `${process.env.FRONTEND_URL}/default-og.jpg`;
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords,
      focusKeyword,
      canonicalUrl,
      ogImage,
      twitterCard: 'summary_large_image',
      noindex: false,
      nofollow: false
    };
  }

  // Generate SEO-optimized title
  generateTitle(title) {
    if (title.length <= 60) return title;
    
    // Truncate to 57 chars and add "..."
    return title.substring(0, 57) + '...';
  }

  // Generate meta description
  generateDescription(excerpt, content) {
    let description = excerpt || '';
    
    if (!description) {
      // Extract from content (remove HTML tags)
      const plainText = content.replace(/<[^>]*>/g, '');
      description = plainText.substring(0, 160);
    }
    
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
    
    return description;
  }

  // Extract keywords using TF-IDF
  extractKeywords(title, content, limit = 10) {
    try {
      if (!title || !content) return [];
      
      const text = `${title} ${content}`.toLowerCase();
      const words = text
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      const frequency = {};
      words.forEach(word => {
        if (this.isStopword(word)) return;
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      const keywords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word]) => word);
      
      return keywords;
    } catch (error) {
      console.error('Keyword extraction error:', error);
      return [];
    }
  }

  // Check if word is stopword
  isStopword(word) {
    const stopwords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ];
    return stopwords.includes(word);
  }

  // Generate structured data (JSON-LD)
  generateStructuredData(blog) {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.seo.description || blog.excerpt,
      image: blog.featuredImage?.url,
      datePublished: blog.publishDate?.toISOString(),
      dateModified: blog.updatedAt?.toISOString(),
      author: {
        '@type': 'Person',
        name: blog.author?.name,
        url: `${process.env.FRONTEND_URL}/author/${blog.author?.slug}`
      },
      publisher: {
        '@type': 'Organization',
        name: process.env.SITE_NAME || 'Blog',
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.FRONTEND_URL}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': blog.seo.canonicalUrl
      }
    };

    // Add article section if categories exist
    if (blog.categories?.length) {
      baseData.articleSection = blog.categories.map(cat => cat.name);
    }

    // Add keywords
    if (blog.seo.keywords?.length) {
      baseData.keywords = blog.seo.keywords.join(', ');
    }

    // Add reading time
    if (blog.readingTime) {
      baseData.timeRequired = `PT${blog.readingTime}M`;
    }

    return baseData;
  }

  // Generate FAQ schema (if blog has FAQ blocks)
  generateFAQSchema(faqBlocks) {
    if (!faqBlocks || faqBlocks.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqBlocks.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  // Generate breadcrumb schema
  generateBreadcrumbSchema(blog) {
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.FRONTEND_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${process.env.FRONTEND_URL}/blog`
      }
    ];

    // Add category if exists
    if (blog.categories?.[0]) {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: blog.categories[0].name,
        item: `${process.env.FRONTEND_URL}/blog/category/${blog.categories[0].slug}`
      });
    }

    // Add current post
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: blog.title,
      item: blog.seo.canonicalUrl
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  }

  // Calculate SEO score (0-100)
  calculateSEOScore(blog) {
    let score = 0;
    const checks = [];

    if (!blog) return { score: 0, checks };

    const seoTitle = blog.seo?.title || blog.title || '';
    const seoDescription = blog.seo?.description || blog.excerpt || '';
    const content = blog.content || '';

    if (seoTitle.length >= 30 && seoTitle.length <= 60) {
      score += 15;
      checks.push({ name: 'Title Length', status: 'pass' });
    } else {
      checks.push({ name: 'Title Length', status: 'fail', message: 'Title should be 30-60 characters' });
    }

    if (seoDescription.length >= 120 && seoDescription.length <= 160) {
      score += 15;
      checks.push({ name: 'Meta Description', status: 'pass' });
    } else {
      checks.push({ name: 'Meta Description', status: 'fail', message: 'Description should be 120-160 characters' });
    }

    if (blog.seo?.focusKeyword && blog.title && blog.title.toLowerCase().includes(blog.seo.focusKeyword.toLowerCase())) {
      score += 15;
      checks.push({ name: 'Keyword in Title', status: 'pass' });
    } else {
      checks.push({ name: 'Keyword in Title', status: 'fail' });
    }

    // Featured image exists
    if (blog.featuredImage?.url) {
      score += 10;
      checks.push({ name: 'Featured Image', status: 'pass' });
    } else {
      checks.push({ name: 'Featured Image', status: 'fail' });
    }

    // Alt text for featured image
    if (blog.featuredImage?.alt) {
      score += 10;
      checks.push({ name: 'Image Alt Text', status: 'pass' });
    } else {
      checks.push({ name: 'Image Alt Text', status: 'fail' });
    }

    // Content length (min 300 words)
    const wordCount = blog.wordCount || 0;
    if (wordCount >= 300) {
      score += 15;
      checks.push({ name: 'Content Length', status: 'pass' });
    } else {
      checks.push({ name: 'Content Length', status: 'fail', message: 'Content should be at least 300 words' });
    }

    const linkCount = (content.match(/<a /g) || []).length;
    if (linkCount >= 3) {
      score += 10;
      checks.push({ name: 'Links', status: 'pass' });
    } else {
      checks.push({ name: 'Links', status: 'fail', message: 'Add at least 3 links' });
    }

    // Categories assigned
    if (blog.categories?.length) {
      score += 5;
      checks.push({ name: 'Categories', status: 'pass' });
    } else {
      checks.push({ name: 'Categories', status: 'fail' });
    }

    // Tags assigned
    if (blog.tags?.length) {
      score += 5;
      checks.push({ name: 'Tags', status: 'pass' });
    } else {
      checks.push({ name: 'Tags', status: 'fail' });
    }

    return { score, checks };
  }
}

module.exports = new SEOService();
