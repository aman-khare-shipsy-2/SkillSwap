import { body } from 'express-validator';

export const sendMessageValidator = [
  body('type')
    .isIn(['text', 'image', 'video', 'document', 'link'])
    .withMessage('Message type must be one of: text, image, video, document, link'),
  body('text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Text cannot be empty if provided'),
  body('contentURL')
    .optional()
    .isURL()
    .withMessage('Content URL must be a valid URL if provided'),
];

