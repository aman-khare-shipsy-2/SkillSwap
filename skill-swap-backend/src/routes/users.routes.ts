import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileValidator, addSkillValidator } from '../validators/user.validator';
import {
  getProfile,
  updateProfile,
  addOfferedSkill,
  removeOfferedSkill,
  addDesiredSkill,
  removeDesiredSkill,
  getUserAnalytics,
} from '../controllers/users.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user profile
router.get('/me', getProfile);

// PUT /api/users/me - Update user profile
router.put('/me', validate(updateProfileValidator), updateProfile);

// POST /api/users/me/skills/offered - Add offered skill
router.post('/me/skills/offered', validate(addSkillValidator), addOfferedSkill);

// DELETE /api/users/me/skills/offered/:skillId - Remove offered skill
router.delete('/me/skills/offered/:skillId', removeOfferedSkill);

// POST /api/users/me/skills/desired - Add desired skill
router.post('/me/skills/desired', validate(addSkillValidator), addDesiredSkill);

// DELETE /api/users/me/skills/desired/:skillId - Remove desired skill
router.delete('/me/skills/desired/:skillId', removeDesiredSkill);

// GET /api/users/me/analytics - Get user analytics
router.get('/me/analytics', getUserAnalytics);

export default router;

