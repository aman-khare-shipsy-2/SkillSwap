import { body } from 'express-validator';

export const createRequestValidator = [
  body('receiverId')
    .isMongoId()
    .withMessage('Receiver ID must be a valid MongoDB ObjectId'),
  body('offeredSkillId')
    .isMongoId()
    .withMessage('Offered skill ID must be a valid MongoDB ObjectId'),
  body('requestedSkillId')
    .isMongoId()
    .withMessage('Requested skill ID must be a valid MongoDB ObjectId'),
];

