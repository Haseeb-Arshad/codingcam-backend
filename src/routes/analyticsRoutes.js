const { Router } = require('express');
const { AnalyticsController } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);
router.get('/daily', AnalyticsController.getDailyStats);
router.get('/languages', AnalyticsController.getLanguageStats);
router.get('/projects', AnalyticsController.getProjectStats);

module.exports = router; 