const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const Logger = require('../utils/logger');

const AuthService = {
  async register(email, password, username, fullName) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      fullName
    });

    // Generate API key if not already generated
    if (!user.apiKey) {
      user.generateApiKey();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' });

    // Log new user registration
    Logger.info(`New user registered: ${username} (${email})`);

    // Remove password from returned user object 
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token, apiKey: user.apiKey };
  },

  async login(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate API key if not already generated
    if (!user.apiKey) {
      user.generateApiKey();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' });

    // Log user login
    Logger.info(`User logged in: ${user.username} (${user.email})`);

    // Remove password from returned user object
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token, apiKey: user.apiKey };
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  async verifyApiKey(apiKey) {
    try {
      const user = await User.findOne({ apiKey });
      if (!user) {
        throw new Error('Invalid API key');
      }
      return user;
    } catch (error) {
      throw new Error('Invalid API key');
    }
  },

  async refreshApiKey(userId) {
    try {
      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new API key
      user.generateApiKey();
      await user.save();

      return user;
    } catch (error) {
      throw new Error(`Failed to refresh API key: ${error.message}`);
    }
  }
};

module.exports = { AuthService }; 