const { Router } = require('express');
const { AuthController } = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { jwtAuth } = require('../middleware/jwtAuth');
const Joi = require('joi');

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
router.get('/verify-api-key', AuthController.verifyApiKey);
router.post('/refresh-api-key', jwtAuth, AuthController.refreshApiKey);

module.exports = router; 