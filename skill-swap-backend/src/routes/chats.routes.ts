import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateObjectId } from '../middlewares/validate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import { uploadLimiter } from '../middlewares/rateLimiter.middleware';
import { sendMessageValidator } from '../validators/chat.validator';
import {
  getChatSessionController,
  getMyChatsController,
  sendMessageController,
  uploadFileController,
  endChatSessionController,
} from '../controllers/chats.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/chats - Get user's chat sessions
router.get('/', getMyChatsController);

// POST /api/chats/upload - Upload file for chat
router.post('/upload', uploadLimiter, upload.single('file'), uploadFileController);

// GET /api/chats/:id - Get chat session by ID
router.get('/:id', validateObjectId('id'), getChatSessionController);

// POST /api/chats/:id/messages - Send message in chat
router.post(
  '/:id/messages',
  validateObjectId('id'),
  upload.single('file'),
  validate(sendMessageValidator),
  sendMessageController
);

// POST /api/chats/:id/end - End chat session
router.post('/:id/end', validateObjectId('id'), endChatSessionController);

export default router;

