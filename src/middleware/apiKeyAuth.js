const { AuthService } = require('../services/authService');
const Logger = require('../utils/logger');

/**
 * Middleware to authenticate requests using an API key
 * The API key should be provided in the X-API-Key header
 */
const apiKeyAuth = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({ message: 'API key is required' });
    }
    
    // Verify the API key
    try {
      const user = await AuthService.verifyApiKey(apiKey);
      
      // Add user object to request for use in route handlers
      req.user = user;
      
      // Log API key usage
      Logger.logApiKeyUsage(apiKey, user._id, req.originalUrl, 'success');
      
      next();
    } catch (error) {
      // Log failed API key attempt
      Logger.logApiKeyUsage(apiKey, null, req.originalUrl, 'failed');
      
      return res.status(401).json({ message: 'Invalid API key' });
    }
  } catch (error) {
    Logger.error('API key authentication error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { apiKeyAuth }; 