const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Check for token in cookies first, prioritize manager_token for hostel-manager routes
    let token;
    if (req.originalUrl && req.originalUrl.includes('/hostel-manager')) {
      token = req.cookies?.manager_token || req.cookies?.token;
    } else {
      token = req.cookies?.token || req.cookies?.manager_token;
    }
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No valid token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = { 
      id: decoded.id, 
      _id: decoded.id, 
      role: decoded.role || 'admin' 
    };
    req.admin = { id: decoded.id }; // backward compatibility
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = auth;
module.exports.adminOnly = adminOnly;