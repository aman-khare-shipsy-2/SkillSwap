import { body } from 'express-validator';
import { VALIDATION_RULES } from '../utils/constants';
import { isPredefinedSkill } from '../utils/predefinedSkills';

export const createSkillValidator = [
  body('name')
    .trim()
    .isLength({ min: VALIDATION_RULES.SKILL_NAME_MIN_LENGTH, max: VALIDATION_RULES.SKILL_NAME_MAX_LENGTH })
    .withMessage(`Skill name must be between ${VALIDATION_RULES.SKILL_NAME_MIN_LENGTH} and ${VALIDATION_RULES.SKILL_NAME_MAX_LENGTH} characters`)
    .custom((value) => {
      if (!isPredefinedSkill(value)) {
        throw new Error('Only predefined skills are allowed. Please select from the available skills list.');
      }
      return true;
    }),
  body('category')
    .trim()
    .isLength({ min: 1, max: VALIDATION_RULES.CATEGORY_MAX_LENGTH })
    .withMessage(`Category must be between 1 and ${VALIDATION_RULES.CATEGORY_MAX_LENGTH} characters`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`),
];

export const updateSkillValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.SKILL_NAME_MIN_LENGTH, max: VALIDATION_RULES.SKILL_NAME_MAX_LENGTH })
    .withMessage(`Skill name must be between ${VALIDATION_RULES.SKILL_NAME_MIN_LENGTH} and ${VALIDATION_RULES.SKILL_NAME_MAX_LENGTH} characters`)
    .custom((value) => {
      if (value && !isPredefinedSkill(value)) {
        throw new Error('Only predefined skills are allowed. Please select from the available skills list.');
      }
      return true;
    }),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: VALIDATION_RULES.CATEGORY_MAX_LENGTH })
    .withMessage(`Category must be between 1 and ${VALIDATION_RULES.CATEGORY_MAX_LENGTH} characters`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description cannot exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`),
];

