const { Router } = require('express');
const { ActivityController } = require('../controllers/activityController');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { validate } = require('../middleware/validation');
const Logger = require('../utils/logger');
const Joi = require('joi');

const router = Router();

// Schema specific to extension heartbeats
const heartbeatSchema = Joi.object({
  project_name: Joi.string().allow(null, ''),
  language_name: Joi.string().allow(null, ''),
  editor: Joi.string().required(),
  platform: Joi.string().required(),
  file_path: Joi.string().required(),
  line_count: Joi.number().allow(null),
  cursor_position: Joi.number().allow(null),
  duration_seconds: Joi.number().default(0),
  started_at: Joi.date().iso().required(),
  ended_at: Joi.date().iso().required()
});

// Schema for coding sessions
const sessionSchema = Joi.object({
  session_id: Joi.string().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().required(),
  duration_seconds: Joi.number().required(),
  files_count: Joi.number().required(),
  languages: Joi.object().pattern(
    Joi.string(),
    Joi.number()
  ).required(),
  files: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      edits: Joi.number().required(),
      duration: Joi.number().required(),
      language: Joi.string().required(),
      lines: Joi.number().required(),
      keystrokes: Joi.number().required()
    })
  ).required(),
  platform: Joi.string().required(),
  editor: Joi.string().required(),
  is_offline_sync: Joi.boolean().default(false)
});

// Apply API key authentication middleware to all routes
router.use(apiKeyAuth);

// Extension specific routes
router.post('/heartbeat', validate(heartbeatSchema), (req, res, next) => {
  // Log heartbeat activity
  Logger.logActivity(req.user._id, 'extension_heartbeat', { 
    file: req.body.file_path,
    project: req.body.project_name,
    language: req.body.language_name
  });
  ActivityController.recordActivity(req, res, next);
});

// Add route for coding sessions
router.post('/sessions', validate(sessionSchema), (req, res) => {
  // Log session activity
  Logger.logActivity(req.user._id, 'coding_session', { 
    sessionId: req.body.session_id,
    duration: req.body.duration_seconds,
    filesCount: req.body.files_count,
    isOfflineSync: req.body.is_offline_sync
  });
  
  // Use activity controller to record the session
  ActivityController.recordSession(req, res);
});

router.get('/status', (req, res) => {
  // Log status check
  Logger.logActivity(req.user._id, 'extension_status_check');
  
  res.status(200).json({ 
    status: 'ok',
    message: 'Extension API is working correctly',
    user: {
      id: req.user._id,
      username: req.user.username
    }
  });
});

module.exports = router; 