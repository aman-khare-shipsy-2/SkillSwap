import { Request, Response, NextFunction } from 'express';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../services/skills.service';
import { sendSuccess, sendError, sendPagination } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';
import { PREDEFINED_SKILLS } from '../utils/predefinedSkills';

export const getAllSkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, search, page, limit } = req.query;

    const result = await getAllSkills({
      category: category as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    sendPagination(res, result.skills, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const skill = await getSkillById(id);
    sendSuccess(res, skill);
  } catch (error) {
    next(error);
  }
};

export const createSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { name, category, description } = req.body;

    if (!name || !category) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const skill = await createSkill({
      name,
      category,
      description,
      createdBy: req.userId,
    });

    sendSuccess(res, skill, SUCCESS_MESSAGES.SKILL_CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const updateSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const skill = await updateSkill(id, { name, category, description });
    sendSuccess(res, skill, SUCCESS_MESSAGES.SKILL_UPDATED);
  } catch (error) {
    next(error);
  }
};

export const deleteSkillController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteSkill(id);
    sendSuccess(res, null, SUCCESS_MESSAGES.SKILL_DELETED);
  } catch (error) {
    next(error);
  }
};

// Get predefined skills list
export const getPredefinedSkillsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(res, PREDEFINED_SKILLS);
  } catch (error) {
    next(error);
  }
};

// Manually seed predefined skills (useful for fixing missing skills)
export const seedSkillsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { seedPredefinedSkills } = await import('../utils/seedSkills');
    await seedPredefinedSkills();
    sendSuccess(res, { message: 'Skills seeded successfully' });
  } catch (error) {
    next(error);
  }
};

