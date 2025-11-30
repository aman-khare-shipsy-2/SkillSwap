// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_MISSING: 'No token provided',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  
  // Skills
  SKILL_NOT_FOUND: 'Skill not found',
  SKILL_ALREADY_EXISTS: 'Skill already exists',
  SKILL_NOT_PREDEFINED: 'Only predefined skills are allowed. Please select from the available skills list.',
  
  // Requests
  REQUEST_NOT_FOUND: 'Request not found',
  REQUEST_ALREADY_EXISTS: 'Request already exists',
  CANNOT_SEND_TO_SELF: 'Cannot send request to yourself',
  REQUEST_EXPIRED: 'Request has expired',
  
  // Chat
  CHAT_NOT_FOUND: 'Chat session not found',
  NOT_CHAT_PARTICIPANT: 'You are not a participant in this chat',
  
  // Rating
  RATING_NOT_FOUND: 'Rating not found',
  CANNOT_RATE_SELF: 'Cannot rate yourself',
  ALREADY_RATED: 'You have already rated this session',
  
  // Verification
  TEST_NOT_FOUND: 'Verification test not found',
  TEST_ALREADY_COMPLETED: 'Test has already been completed',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'File upload failed',
  
  // Validation
  VALIDATION_ERROR: 'Validation error',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_INPUT: 'Invalid input data',
  
  // General
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  FORBIDDEN: 'Access forbidden',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // User
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  
  // Skills
  SKILL_CREATED: 'Skill created successfully',
  SKILL_UPDATED: 'Skill updated successfully',
  SKILL_DELETED: 'Skill deleted successfully',
  
  // Requests
  REQUEST_CREATED: 'Request created successfully',
  REQUEST_ACCEPTED: 'Request accepted successfully',
  REQUEST_REJECTED: 'Request rejected successfully',
  REQUEST_FORFEITED: 'Request forfeited successfully',
  
  // Chat
  MESSAGE_SENT: 'Message sent successfully',
  CHAT_ENDED: 'Chat session ended successfully',
  
  // Rating
  RATING_CREATED: 'Rating submitted successfully',
  
  // Verification
  TEST_STARTED: 'Verification test started',
  TEST_SUBMITTED: 'Test submitted successfully',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  // User
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  BIO_MAX_LENGTH: 500,
  LOCATION_MAX_LENGTH: 100,
  
  // Skill
  SKILL_NAME_MIN_LENGTH: 2,
  SKILL_NAME_MAX_LENGTH: 100,
  CATEGORY_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  
  // Rating
  RATING_MIN: 1,
  RATING_MAX: 5,
  COMMENT_MAX_LENGTH: 500,
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  // Size limits in bytes
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB (general limit)
  
  // Allowed MIME types
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

// Rating History
export const RATINGS_HISTORY_LIMIT = 20;

// Request Expiration
export const REQUEST_EXPIRATION_DAYS = 30;

// Verification Test
export const VERIFICATION_PASSING_SCORE = 70; // Percentage

