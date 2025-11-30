import { body } from 'express-validator';

export const startTestValidator = [
  body('skillId')
    .isMongoId()
    .withMessage('Skill ID must be a valid MongoDB ObjectId'),
];

export const submitTestValidator = [
  body('testId')
    .isMongoId()
    .withMessage('Test ID must be a valid MongoDB ObjectId'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionIndex')
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
  body('answers.*.answer')
    .notEmpty()
    .withMessage('Answer is required for each question'),
];

