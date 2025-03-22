const { AuthService } = require('../services/authService');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  authenticate
}; 