import { body } from 'express-validator';
import { VALIDATION_RULES } from '../utils/constants';

export const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: VALIDATION_RULES.NAME_MIN_LENGTH, max: VALIDATION_RULES.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${VALIDATION_RULES.NAME_MIN_LENGTH} and ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: VALIDATION_RULES.EMAIL_MAX_LENGTH })
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH, max: VALIDATION_RULES.PASSWORD_MAX_LENGTH })
    .withMessage(`Password must be between ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('offeredSkills')
    .optional()
    .isArray()
    .withMessage('Offered skills must be an array'),
  body('offeredSkills.*')
    .optional()
    .isMongoId()
    .withMessage('Each offered skill must be a valid MongoDB ObjectId'),
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

