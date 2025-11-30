// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  
  // Users
  GET_PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  ADD_OFFERED_SKILL: '/users/me/skills/offered',
  REMOVE_OFFERED_SKILL: '/users/me/skills/offered',
  ADD_DESIRED_SKILL: '/users/me/skills/desired',
  REMOVE_DESIRED_SKILL: '/users/me/skills/desired',
  GET_ANALYTICS: '/users/me/analytics',
  
  // Skills
  GET_SKILLS: '/skills',
  GET_SKILL: '/skills',
  CREATE_SKILL: '/skills',
  UPDATE_SKILL: '/skills',
  DELETE_SKILL: '/skills',
  
  // Requests
  CREATE_REQUEST: '/requests',
  GET_MY_REQUESTS: '/requests/me',
  SEARCH_USERS: '/requests/search',
  ACCEPT_REQUEST: '/requests',
  REJECT_REQUEST: '/requests',
  FORFEIT_REQUEST: '/requests',
  
  // Chats
  GET_MY_CHATS: '/chats',
  GET_CHAT: '/chats',
  SEND_MESSAGE: '/chats',
  UPLOAD_FILE: '/chats/upload',
  END_CHAT: '/chats',
  
  // Ratings
  CREATE_RATING: '/ratings',
  GET_MY_RATINGS: '/ratings/me',
  GET_RATING: '/ratings',
  
  // Verification
  START_TEST: '/verification/start',
  SUBMIT_TEST: '/verification/submit',
  GET_TEST_STATUS: '/verification/status',
  GET_TEST: '/verification',
} as const;

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  VERIFICATION: '/verification',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please login.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  REGISTER_SUCCESS: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SKILL_ADDED: 'Skill added successfully!',
  REQUEST_SENT: 'Request sent successfully!',
  REQUEST_ACCEPTED: 'Request accepted!',
  MESSAGE_SENT: 'Message sent!',
} as const;

// Validation Rules
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 20 * 60 * 1024 * 1024, // 20 minutes (approx)
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

