// ============= SLUG GENERATOR =============
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

// Generate unique slug
async function generateUniqueSlug(text, Model, currentId = null) {
  let slug = generateSlug(text);
  let counter = 1;
  let uniqueSlug = slug;

  while (true) {
    const query = { slug: uniqueSlug };
    if (currentId) query._id = { $ne: currentId };
    
    const exists = await Model.findOne(query);
    if (!exists) break;
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

// ============= READING TIME CALCULATOR =============
function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 0;
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words
  const words = plainText.trim().split(/\s+/).length;
  
  // Calculate minutes (round up)
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes;
}

// ============= EXCERPT GENERATOR =============
function generateExcerpt(content, maxLength = 160) {
  if (!content) return '';
  
  // Remove HTML tags
  let plainText = content.replace(/<[^>]*>/g, '');
  
  // Trim to max length
  if (plainText.length > maxLength) {
    plainText = plainText.substring(0, maxLength - 3) + '...';
  }
  
  return plainText;
}

// ============= PAGINATION HELPER =============
function getPaginationData(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
}

// ============= DATE FORMATTER =============
function formatDate(date, format = 'default') {
  const d = new Date(date);
  
  const formats = {
    default: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    short: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    iso: d.toISOString(),
    relative: getRelativeTime(d)
  };
  
  return formats[format] || formats.default;
}

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// ============= URL HELPER =============
function buildUrl(base, path, params = {}) {
  let url = `${base}${path}`;
  
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

// ============= SANITIZE FILENAME =============
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// ============= GENERATE SITEMAP ENTRY =============
function generateSitemapEntry(blog) {
  return {
    loc: blog.seo?.canonicalUrl || `${process.env.FRONTEND_URL}/blog/${blog.slug}`,
    lastmod: blog.updatedAt.toISOString(),
    changefreq: 'weekly',
    priority: blog.isFeatured ? 0.9 : 0.7
  };
}

// ============= WORD COUNT =============
function countWords(text) {
  if (!text) return 0;
  const plainText = text.replace(/<[^>]*>/g, '');
  return plainText.trim().split(/\s+/).length;
}

module.exports = {
  generateSlug,
  generateUniqueSlug,
  calculateReadingTime,
  generateExcerpt,
  getPaginationData,
  formatDate,
  getRelativeTime,
  buildUrl,
  sanitizeFilename,
  generateSitemapEntry,
  countWords
};
