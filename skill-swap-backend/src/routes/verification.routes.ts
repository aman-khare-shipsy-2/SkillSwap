import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateObjectId } from '../middlewares/validate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { startTestValidator, submitTestValidator } from '../validators/verification.validator';
import {
  startTestController,
  submitTestController,
  getTestStatusController,
  getTestByIdController,
} from '../controllers/verification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/verification/start - Start verification test
router.post('/start', validate(startTestValidator), startTestController);

// POST /api/verification/submit - Submit test answers
router.post('/submit', validate(submitTestValidator), submitTestController);

// GET /api/verification/status - Get verification status
router.get('/status', getTestStatusController);

// GET /api/verification/:id - Get test by ID
router.get('/:id', validateObjectId('id'), getTestByIdController);

export default router;

