// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePictureURL?: string;
  bio?: string;
  location?: string;
  offeredSkills: Skill[];
  desiredSkills: Skill[];
  averageRating: number;
  verifiedSkills: string[];
  totalSessionsTaught: number;
  totalSkillsLearnt: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Skill Types
export interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface SkillRequest {
  _id: string;
  senderId: User | string;
  receiverId: User | string;
  offeredSkillId: Skill | string;
  requestedSkillId: Skill | string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'forfeited';
  message?: string;
  expiresAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  forfeitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface Message {
  _id: string;
  senderId: User | string;
  type: 'text' | 'image' | 'video' | 'document' | 'link';
  text?: string;
  contentURL?: string;
  timestamp: string;
}

export interface ChatSession {
  _id: string;
  requestId: SkillRequest | string;
  participants: User[] | string[];
  messages: Message[];
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Rating Types
export interface Rating {
  _id: string;
  ratedUserId: User | string;
  ratedById: User | string;
  skillId: Skill | string;
  score: number;
  comment?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Verification Types
export interface VerificationTest {
  _id: string;
  userId: User | string;
  skillId: Skill | string;
  questions: Question[];
  answers?: Answer[];
  score?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'passed' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface Question {
  _id?: string;
  question?: string; // For backward compatibility
  text?: string; // Backend uses 'text' field
  options: string[];
  correctAnswer?: string; // Not included in test response
  type?: 'multiple-choice' | 'true-false';
}

export interface Answer {
  questionId?: string; // Optional for backward compatibility
  questionIndex?: number; // Backend uses questionIndex
  answer: string | number;
}

// Analytics Types
export interface Analytics {
  _id?: string;
  userId?: User | string;
  skillId?: Skill | string;
  averageRating: number;
  totalSessionsTaught: number;
  totalSkillsLearnt: number;
  ratingsTrend: Array<{
    rating: number;
    skill?: string | Skill;
    sessionId?: string;
    timestamp: string | Date;
  }>;
  sessionsPerMonth: Array<{
    month: string;
    count: number;
  }>;
  totalRatingAverage?: number;
  updatedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: unknown;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  offeredSkills?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

