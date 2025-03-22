const { Router } = require('express');
const { ActivityController } = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const router = Router();

const activitySchema = Joi.object({
  project_name: Joi.string().required(),
  language_name: Joi.string().required(),
  editor: Joi.string().required(),
  platform: Joi.string().required(),
  file_path: Joi.string().required(),
  line_count: Joi.number().required(),
  cursor_position: Joi.number().required(),
  duration_seconds: Joi.number().required(),
  started_at: Joi.date().iso().required(),
  ended_at: Joi.date().iso().required()
});

// Create a combined authentication middleware that tries API key first, then falls back to JWT
const combinedAuth = async (req, res, next) => {
  // Check for API key in header
  const apiKey = req.header('X-API-Key');
  
  if (apiKey) {
    // If API key is present, use apiKeyAuth
    return apiKeyAuth(req, res, next);
  } else {
    // Otherwise, use JWT authentication
    return authenticate(req, res, next);
  }
};

// Apply combined authentication middleware to all routes
router.use(combinedAuth);

// Define routes
router.post('/', validate(activitySchema), ActivityController.recordActivity);
router.get('/', ActivityController.getUserActivities);

// Add routes for coding sessions
router.get('/sessions', ActivityController.getUserSessions);

module.exports = router; 