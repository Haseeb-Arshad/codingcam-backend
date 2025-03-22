import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).optional(),
  fullName: Joi.string().optional(),
  country: Joi.string().optional(),
  timezone: Joi.string().optional()
});

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), UserController.updateProfile);
router.get('/:userId', UserController.getPublicProfile);

export default router;