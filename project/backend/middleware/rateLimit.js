const rateLimit = require('express-rate-limit'); // Install: express-rate-limit

// Rate limit for public API endpoints
const rateLimitPublic = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for admin endpoints
const rateLimitAdmin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Higher limit for admin
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for search (stricter)
const rateLimitSearch = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please slow down.'
  }
});

// Rate limit for comments
const rateLimitComments = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 comments per hour
  message: {
    success: false,
    message: 'Comment limit reached. Please try again later.'
  }
});

module.exports = {
  rateLimitPublic,
  rateLimitAdmin,
  rateLimitSearch,
  rateLimitComments
};
