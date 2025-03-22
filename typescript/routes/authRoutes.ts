import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().min(3).required(),
  fullName: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

export default router;