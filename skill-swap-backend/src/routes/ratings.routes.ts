import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateObjectId } from '../middlewares/validate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRatingValidator } from '../validators/rating.validator';
import {
  createRatingController,
  getMyRatingsController,
  getRatingByIdController,
} from '../controllers/ratings.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/ratings - Create rating
router.post('/', validate(createRatingValidator), createRatingController);

// GET /api/ratings/me - Get user's ratings
router.get('/me', getMyRatingsController);

// GET /api/ratings/:id - Get rating by ID
router.get('/:id', validateObjectId('id'), getRatingByIdController);

export default router;

