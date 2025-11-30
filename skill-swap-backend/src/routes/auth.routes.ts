import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';

const router = Router();

// POST /api/auth/register - User registration
router.post('/register', authLimiter, validate(registerValidator), register);

// POST /api/auth/login - User login
router.post('/login', authLimiter, validate(loginValidator), login);

export default router;

