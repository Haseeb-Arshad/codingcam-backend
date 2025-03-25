const { Router } = require('express');
const { AuthController } = require('../controllers/authController');
const { UserController } = require('../controllers/userController');
const { AnalyticsController } = require('../controllers/analyticsController');
const { LeaderboardController } = require('../controllers/leaderboardController');
const { SettingsController } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Public routes
router.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is operational',
    timestamp: new Date()
  });
});

// Authentication routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/verify', authenticate, (req, res) => {
  res.status(200).json({ valid: true });
});

// User routes (authenticated)
router.get('/user/profile', authenticate, UserController.getProfile);
router.put('/user/profile', authenticate, UserController.updateProfile);

// Settings routes (authenticated)
router.get('/user/settings', authenticate, SettingsController.getUserSettings);
router.put('/user/settings', authenticate, SettingsController.updateUserSettings);
router.post('/user/location', authenticate, SettingsController.updateLocation);

// Analytics routes (authenticated)
router.get('/analytics/daily', authenticate, AnalyticsController.getDailyStats);
router.get('/analytics/languages', authenticate, AnalyticsController.getLanguageStats);
router.get('/analytics/projects', authenticate, AnalyticsController.getProjectStats);
router.get('/analytics/profile', authenticate, AnalyticsController.getProfileData);
router.get('/analytics/report', authenticate, async (req, res, next) => {
  try {
    await AnalyticsController.getReportData(req, res);
  } catch (error) {
    next(error);
  }
});

// Leaderboard route (public)
router.get('/leaderboard', LeaderboardController.getLeaderboard);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Frontend route error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router; 