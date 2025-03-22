import { Router } from 'express';
import { ActivityController } from '../controllers/activityController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

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

// Apply authentication middleware to all routes
router.use(authenticate);

// Define routes
router.post('/', validate(activitySchema), ActivityController.recordActivity);
router.get('/', ActivityController.getUserActivities);

export default router;