import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateObjectId } from '../middlewares/validate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateSkillValidator } from '../validators/skill.validator';
import {
  getAllSkillsController,
  getSkillByIdController,
  updateSkillController,
  deleteSkillController,
  getPredefinedSkillsController,
  seedSkillsController,
} from '../controllers/skills.controller';

const router = Router();

// GET /api/skills/predefined - Get predefined skills list (public)
router.get('/predefined', getPredefinedSkillsController);

// POST /api/skills/seed - Manually seed predefined skills (for fixing missing skills)
router.post('/seed', seedSkillsController);

// GET /api/skills - Get all skills (with search, filter, pagination)
router.get('/', getAllSkillsController);

// GET /api/skills/:id - Get skill by ID
router.get('/:id', validateObjectId('id'), getSkillByIdController);

// POST /api/skills - Create new skill (disabled - users can only select from predefined skills)
// Skills are automatically seeded on server startup. Users can only select from predefined skills.
// This endpoint is kept commented for potential admin/system use in the future.
// router.post('/', authenticate, validate(createSkillValidator), createSkillController);

// PUT /api/skills/:id - Update skill (authenticated)
router.put('/:id', authenticate, validateObjectId('id'), validate(updateSkillValidator), updateSkillController);

// DELETE /api/skills/:id - Delete skill (authenticated)
router.delete('/:id', authenticate, validateObjectId('id'), deleteSkillController);

export default router;

