import Skill, { ISkill } from '../models/Skill';
import { ERROR_MESSAGES, VALIDATION_RULES } from '../utils/constants';
import { isPredefinedSkill, getPredefinedSkill } from '../utils/predefinedSkills';
import mongoose from 'mongoose';

export interface SkillFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSkills {
  skills: ISkill[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get all skills with pagination and filters
export const getAllSkills = async (filters: SkillFilters = {}): Promise<PaginatedSkills> => {
  const page = filters.page || VALIDATION_RULES.DEFAULT_PAGE;
  const limit = Math.min(filters.limit || VALIDATION_RULES.DEFAULT_LIMIT, VALIDATION_RULES.MAX_LIMIT);
  const skip = (page - 1) * limit;

  // Build query
  const query: Record<string, unknown> = {};

  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }

  // Search by name (case-insensitive)
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  // Execute query
  const [skills, total] = await Promise.all([
    Skill.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Skill.countDocuments(query),
  ]);

  return {
    skills,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Get skill by ID
export const getSkillById = async (skillId: string): Promise<ISkill> => {
  if (!mongoose.Types.ObjectId.isValid(skillId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const skill = await Skill.findById(skillId).populate('createdBy', 'name email');
  if (!skill) {
    throw new Error(ERROR_MESSAGES.SKILL_NOT_FOUND);
  }

  return skill;
};

// Create new skill
export const createSkill = async (
  skillData: {
    name: string;
    category: string;
    description?: string;
    createdBy: string;
  }
): Promise<ISkill> => {
  // Validate that the skill is in the predefined list
  if (!isPredefinedSkill(skillData.name)) {
    throw new Error(ERROR_MESSAGES.SKILL_NOT_PREDEFINED);
  }

  // Get the predefined skill to ensure correct category
  const predefinedSkill = getPredefinedSkill(skillData.name);
  if (!predefinedSkill) {
    throw new Error(ERROR_MESSAGES.SKILL_NOT_PREDEFINED);
  }

  // Use the category from predefined skills to ensure consistency
  const finalCategory = predefinedSkill.category;

  // Check for duplicate name (case-insensitive)
  const existingSkill = await Skill.findOne({
    name: { $regex: new RegExp(`^${skillData.name.trim()}$`, 'i') }
  });
  if (existingSkill) {
    // Return existing skill instead of throwing error
    return existingSkill;
  }

  // Validate createdBy is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(skillData.createdBy)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const skill = new Skill({
    name: predefinedSkill.name, // Use exact name from predefined list
    category: finalCategory,
    description: skillData.description || '',
    createdBy: skillData.createdBy,
  });

  await skill.save();
  await skill.populate('createdBy', 'name email');

  return skill;
};

// Update skill
export const updateSkill = async (
  skillId: string,
  updates: {
    name?: string;
    category?: string;
    description?: string;
  }
): Promise<ISkill> => {
  if (!mongoose.Types.ObjectId.isValid(skillId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new Error(ERROR_MESSAGES.SKILL_NOT_FOUND);
  }

  // If name is being updated, validate it's still a predefined skill
  if (updates.name && updates.name !== skill.name) {
    if (!isPredefinedSkill(updates.name)) {
      throw new Error(ERROR_MESSAGES.SKILL_NOT_PREDEFINED);
    }

    // Get the predefined skill to ensure correct category
    const predefinedSkill = getPredefinedSkill(updates.name);
    if (predefinedSkill) {
      updates.name = predefinedSkill.name;
      // Update category to match predefined skill
      if (!updates.category) {
        updates.category = predefinedSkill.category;
      }
    }

    // Check for duplicate name
    const existingSkill = await Skill.findOne({
      name: { $regex: new RegExp(`^${updates.name.trim()}$`, 'i') },
      _id: { $ne: skillId }
    });
    if (existingSkill) {
      throw new Error(ERROR_MESSAGES.SKILL_ALREADY_EXISTS);
    }
  }

  // Update fields
  if (updates.name) skill.name = updates.name;
  if (updates.category) skill.category = updates.category;
  if (updates.description !== undefined) skill.description = updates.description;

  await skill.save();
  await skill.populate('createdBy', 'name email');

  return skill;
};

// Delete skill
export const deleteSkill = async (skillId: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(skillId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new Error(ERROR_MESSAGES.SKILL_NOT_FOUND);
  }

  // Hard delete (can be changed to soft delete if needed)
  await Skill.findByIdAndDelete(skillId);
};

