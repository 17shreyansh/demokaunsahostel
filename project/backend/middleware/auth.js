const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then fallback to Authorization header
    let token = req.cookies.authToken;
    
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
    req.admin = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

module.exports = auth;