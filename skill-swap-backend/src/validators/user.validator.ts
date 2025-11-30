import { body } from 'express-validator';
import { VALIDATION_RULES } from '../utils/constants';

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.NAME_MIN_LENGTH, max: VALIDATION_RULES.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${VALIDATION_RULES.NAME_MIN_LENGTH} and ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.BIO_MAX_LENGTH })
    .withMessage(`Bio cannot exceed ${VALIDATION_RULES.BIO_MAX_LENGTH} characters`),
  body('location')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.LOCATION_MAX_LENGTH })
    .withMessage(`Location cannot exceed ${VALIDATION_RULES.LOCATION_MAX_LENGTH} characters`),
  body('profilePictureURL')
    .optional()
    .isURL()
    .withMessage('Profile picture URL must be a valid URL'),
];

export const addSkillValidator = [
  body('skillId')
    .isMongoId()
    .withMessage('Skill ID must be a valid MongoDB ObjectId'),
];

