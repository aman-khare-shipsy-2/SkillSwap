import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import skillsRoutes from './skills.routes';
import requestsRoutes from './requests.routes';
import chatsRoutes from './chats.routes';
import ratingsRoutes from './ratings.routes';
import verificationRoutes from './verification.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/skills', skillsRoutes);
router.use('/requests', requestsRoutes);
router.use('/chats', chatsRoutes);
router.use('/ratings', ratingsRoutes);
router.use('/verification', verificationRoutes);

export default router;

