const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const Logger = require('../utils/logger');

/**
 * Middleware to authenticate requests using a JWT token
 * The token should be provided in the Authorization header as Bearer token
 */
const jwtAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Find user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid token - user not found' });
      }
      
      // Add user object to request for use in route handlers
      req.user = user;
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    Logger.error('JWT authentication error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { jwtAuth }; 