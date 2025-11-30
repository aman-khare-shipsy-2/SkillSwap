import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateObjectId } from '../middlewares/validate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRequestValidator } from '../validators/request.validator';
import {
  createRequestController,
  getMyRequestsController,
  acceptRequestController,
  rejectRequestController,
  forfeitRequestController,
  searchUsersController,
} from '../controllers/requests.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/requests - Create skill exchange request
router.post('/', validate(createRequestValidator), createRequestController);

// GET /api/requests/me - Get user's requests (sent and received)
router.get('/me', getMyRequestsController);

// GET /api/requests/search - Search users for skill exchange
router.get('/search', searchUsersController);

// POST /api/requests/:id/accept - Accept request
router.post('/:id/accept', validateObjectId('id'), acceptRequestController);

// POST /api/requests/:id/reject - Reject request
router.post('/:id/reject', validateObjectId('id'), rejectRequestController);

// POST /api/requests/:id/forfeit - Forfeit request
router.post('/:id/forfeit', validateObjectId('id'), forfeitRequestController);

export default router;

