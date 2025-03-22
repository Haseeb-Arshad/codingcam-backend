const { Router } = require('express');
const { AuthController } = require('../controllers/authController');
const { UserController } = require('../controllers/userController');
const { AnalyticsController } = require('../controllers/analyticsController');
const { LeaderboardController } = require('../controllers/leaderboardController');
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

// User routes (authenticated)
router.get('/user/profile', authenticate, UserController.getProfile);
router.put('/user/profile', authenticate, UserController.updateProfile);

// Analytics routes (authenticated)
router.get('/analytics/daily', authenticate, AnalyticsController.getDailyStats);
router.get('/analytics/languages', authenticate, AnalyticsController.getLanguageStats);
router.get('/analytics/projects', authenticate, AnalyticsController.getProjectStats);

// Leaderboard route (public)
router.get('/leaderboard', LeaderboardController.getLeaderboard);

module.exports = router; 