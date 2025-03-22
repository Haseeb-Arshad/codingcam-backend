const { Router } = require('express');
const { UserController } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

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

module.exports = router; 