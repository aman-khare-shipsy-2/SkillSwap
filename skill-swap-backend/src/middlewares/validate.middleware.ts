import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants';

// Middleware to validate request using express-validator
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      sendError(
        res,
        ERROR_MESSAGES.VALIDATION_ERROR,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        'Validation failed',
        errors.array()
      );
      return;
    }

    next();
  };
};

// Middleware to validate ObjectId parameters
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdRegex.test(id)) {
      sendError(
        res,
        `Invalid ${paramName}. Must be a valid MongoDB ObjectId`,
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    next();
  };
};

// Middleware to validate file upload
export const validateFile = (
  allowedTypes: string[],
  maxSize: number,
  fieldName: string = 'file'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : undefined);

    if (!file) {
      sendError(res, `No ${fieldName} provided`, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      sendError(
        res,
        ERROR_MESSAGES.INVALID_FILE_TYPE,
        HTTP_STATUS.BAD_REQUEST,
        `Allowed types: ${allowedTypes.join(', ')}`
      );
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      sendError(
        res,
        ERROR_MESSAGES.FILE_TOO_LARGE,
        HTTP_STATUS.BAD_REQUEST,
        `Maximum size: ${maxSize / (1024 * 1024)}MB`
      );
      return;
    }

    next();
  };
};

