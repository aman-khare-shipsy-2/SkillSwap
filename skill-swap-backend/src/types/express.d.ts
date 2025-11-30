import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

// Export empty object to make this a module
export {};

