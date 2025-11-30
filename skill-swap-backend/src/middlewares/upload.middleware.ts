import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import config from '../config';
import { FILE_UPLOAD_LIMITS } from '../utils/constants';
import fs from 'fs';
import logger from '../utils/logger';

// Ensure upload directory exists
const uploadDir = config.uploadPath;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${uniqueSuffix}${ext}`;
    
    // Log file upload
    logger.upload(file.originalname, file.size, file.mimetype, {
      userId: (req as { userId?: string }).userId,
      filename,
    });
    
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes: string[] = [
    ...FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES,
    ...FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES,
    ...FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    logger.uploadError(file.originalname, error, {
      userId: (req as { userId?: string }).userId,
      mimetype: file.mimetype,
    });
    cb(error);
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD_LIMITS.MAX_FILE_SIZE,
  },
});

// Specific upload configurations for different file types
export const uploadImage = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [...FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES] as string[];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: FILE_UPLOAD_LIMITS.MAX_IMAGE_SIZE,
  },
});

export const uploadVideo = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [...FILE_UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES] as string[];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
  limits: {
    fileSize: FILE_UPLOAD_LIMITS.MAX_VIDEO_SIZE,
  },
});

export const uploadDocument = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [...FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES] as string[];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (PDF, Word) are allowed'));
    }
  },
  limits: {
    fileSize: FILE_UPLOAD_LIMITS.MAX_DOCUMENT_SIZE,
  },
});

// Helper function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};

