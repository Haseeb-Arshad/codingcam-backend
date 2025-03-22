const { AuthService } = require('../services/authService');
const Logger = require('../utils/logger');

const AuthController = {
  async register(req, res) {
    try {
      const { email, password, username, fullName } = req.body;
      
      const result = await AuthService.register(email, password, username, fullName);
      
      // Log successful registration
      Logger.logAuthEvent(result.user._id, 'register', true, { username, email });
      
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        // Log failed registration attempt
        Logger.logAuthEvent(null, 'register', false, { email, reason: 'Email already exists' });
        
        res.status(409).json({ message: error.message });
        return;
      }
      
      Logger.error('Registration error', error, { email });
      res.status(500).json({ message: error.message });
    }
  },
  
  async login(req, res) {
    let email = null; // Define email outside the try block to ensure it's accessible in the catch block
    
    try {
      const { email: requestEmail, password } = req.body;
      email = requestEmail; // Assign to the outer variable
      
      const result = await AuthService.login(email, password); // Login
      
      // Log successful login
      Logger.logAuthEvent(result.user._id, 'login', true, { email }); // Log the user ID to the database
      
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        // Log failed login attempt
        Logger.logAuthEvent(null, 'login', false, { email, reason: 'Invalid credentials' }); // Log the user ID to the database
        
        res.status(401).json({ message: error.message }); // Return the error message
        return;
      }
      
      Logger.error('Login error', error, { email });
      res.status(500).json({ message: error.message });
    }
  },
  
  async verifyApiKey(req, res) {
    try {
      const apiKey = req.header('X-API-Key'); // Get the API key from the request header
      
      if (!apiKey) {
        return res.status(400).json({ valid: false, message: 'API key is required' }); // Return an error if the API key is not provided
      }
      
      try {
        const user = await AuthService.verifyApiKey(apiKey); // Verify the API key
        
        // Log successful API key verification
        Logger.logApiKeyUsage(apiKey, user._id, '/verify-api-key', 'verified'); // Log the user ID to the database

        return res.status(200).json({ 
          valid: true, 
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          }
        });
      } catch (error) {
        // Log failed API key verification
        Logger.logApiKeyUsage(apiKey, null, '/verify-api-key', 'invalid'); // Log the user ID to the database
        
        return res.status(200).json({ valid: false, message: 'Invalid API key' }); // Return an error if the API key is invalid
      }
    } catch (error) {
      Logger.error('API key verification error', error);
      return res.status(500).json({ valid: false, message: 'Server error' });
    }
  },
  
  async refreshApiKey(req, res) {
    try {
      // User will be available from JWT auth middleware
      const userId = req.user.id;
      
      // Find user by ID
      const user = await AuthService.refreshApiKey(userId); // Refresh the API key
      
      // Log API key refresh
      Logger.logAuthEvent(userId, 'refresh-api-key', true);
      
      res.status(200).json({ apiKey: user.apiKey });
    } catch (error) {
      Logger.error('API key refresh error', error, { userId: req.user?.id });
      res.status(500).json({ message: error.message }); // Return an error if the API key is invalid
    }
  }
};

module.exports = { AuthController }; 