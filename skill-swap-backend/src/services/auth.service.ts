import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import config from '../config';
import { ERROR_MESSAGES } from '../utils/constants';
import logger from '../utils/logger';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  offeredSkills?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

// Generate JWT token
export const generateToken = (userId: string): string => {
  // @ts-expect-error - jwt.sign types are complex, but this works at runtime
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
  }
};

// Register new user
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    logger.db('findOne', 'users', { email: data.email.toLowerCase() });
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      logger.authError('Registration failed - email exists', ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, {
        email: data.email.toLowerCase(),
      });
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.password, // Will be hashed by pre-save hook
      offeredSkills: data.offeredSkills || [],
    });

    logger.db('create', 'users', { email: data.email.toLowerCase(), name: data.name });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString());

    logger.auth('User registered', user._id.toString(), { email: data.email.toLowerCase() });

    // Remove password hash from user object
    const userObject = user.toObject();
    delete (userObject as { passwordHash?: string }).passwordHash;

    return {
      user: userObject as IUser,
      token,
    };
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
      throw error;
    }
    logger.dbError('create', 'users', error instanceof Error ? error : new Error(String(error)), {
      email: data.email.toLowerCase(),
    });
    throw error;
  }
};

// Login user
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    logger.db('findOne', 'users', { email: data.email.toLowerCase() });
    // Find user by email
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      logger.authError('Login failed - user not found', ERROR_MESSAGES.INVALID_CREDENTIALS, {
        email: data.email.toLowerCase(),
      });
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      logger.authError('Login failed - inactive user', ERROR_MESSAGES.UNAUTHORIZED, {
        userId: user._id.toString(),
      });
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      logger.authError('Login failed - invalid password', ERROR_MESSAGES.INVALID_CREDENTIALS, {
        userId: user._id.toString(),
      });
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    logger.auth('User logged in', user._id.toString(), { email: data.email.toLowerCase() });

    // Remove password hash from user object
    const userObject = user.toObject();
    delete (userObject as { passwordHash?: string }).passwordHash;

    return {
      user: userObject as IUser,
      token,
    };
  } catch (error) {
    if (error instanceof Error && (
      error.message === ERROR_MESSAGES.INVALID_CREDENTIALS ||
      error.message === ERROR_MESSAGES.UNAUTHORIZED
    )) {
      throw error;
    }
    logger.dbError('findOne', 'users', error instanceof Error ? error : new Error(String(error)), {
      email: data.email.toLowerCase(),
    });
    throw error;
  }
};

