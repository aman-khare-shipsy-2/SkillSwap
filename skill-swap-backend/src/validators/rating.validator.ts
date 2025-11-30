import { body } from 'express-validator';
import { VALIDATION_RULES } from '../utils/constants';

export const createRatingValidator = [
  body('ratedUserId')
    .isMongoId()
    .withMessage('Rated user ID must be a valid MongoDB ObjectId'),
  body('skillId')
    .isMongoId()
    .withMessage('Skill ID must be a valid MongoDB ObjectId'),
  body('score')
    .isInt({ min: VALIDATION_RULES.RATING_MIN, max: VALIDATION_RULES.RATING_MAX })
    .withMessage(`Rating must be between ${VALIDATION_RULES.RATING_MIN} and ${VALIDATION_RULES.RATING_MAX}`),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.COMMENT_MAX_LENGTH })
    .withMessage(`Comment cannot exceed ${VALIDATION_RULES.COMMENT_MAX_LENGTH} characters`),
  body('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Session ID must be a valid MongoDB ObjectId'),
];

