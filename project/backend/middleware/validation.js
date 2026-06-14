const sanitizeHtml = require('sanitize-html'); // Install: sanitize-html

// Validate blog input
const validateBlog = (req, res, next) => {
  const { title, content, status, categories } = req.body;
  const errors = [];

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  // Content validation
  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  // Sanitize HTML content
  if (content) {
    req.body.content = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe', 'figure', 'figcaption'
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        a: ['href', 'name', 'target', 'rel'],
        iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
        '*': ['class', 'id', 'style']
      },
      allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com', 'codepen.io']
    });
  }

  // Status validation
  const validStatuses = ['draft', 'review', 'scheduled', 'published', 'archived'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Invalid status');
  }

  // Categories validation
  if (categories && !Array.isArray(categories)) {
    errors.push('Categories must be an array');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate query parameters
const validateQuery = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid page number'
    });
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid limit (1-100)'
    });
  }

  next();
};

// Validate comment
const validateComment = (req, res, next) => {
  const { blog, authorName, authorEmail, content } = req.body;
  const errors = [];

  if (!blog) errors.push('Blog ID is required');
  if (!authorName || authorName.trim().length === 0) errors.push('Name is required');
  if (!authorEmail || !isValidEmail(authorEmail)) errors.push('Valid email is required');
  if (!content || content.trim().length === 0) errors.push('Comment content is required');
  if (content && content.length > 2000) errors.push('Comment cannot exceed 2000 characters');

  // Check for spam patterns
  if (content && checkSpamPatterns(content)) {
    return res.status(403).json({
      success: false,
      message: 'Comment flagged as spam'
    });
  }

  // Sanitize comment content (no HTML allowed)
  if (content) {
    req.body.content = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Spam detection helper
const checkSpamPatterns = (text) => {
  const spamKeywords = [
    'viagra', 'cialis', 'casino', 'lottery', 'prize', 
    'click here', 'buy now', 'limited offer', 'make money fast'
  ];
  
  const lowerText = text.toLowerCase();
  return spamKeywords.some(keyword => lowerText.includes(keyword));
};

// Profanity filter helper
const checkProfanity = (text) => {
  const profanityWords = [
    // Add profanity words here
    'badword1', 'badword2'
  ];
  
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
};

// Slug validation
const validateSlug = (req, res, next) => {
  const { slug } = req.body;
  
  if (slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.'
      });
    }
  }
  
  next();
};

module.exports = {
  validateBlog,
  validateQuery,
  validateComment,
  validateSlug
};
