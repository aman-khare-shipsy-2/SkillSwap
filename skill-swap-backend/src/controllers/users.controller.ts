/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Skill from '../models/Skill';
import Analytics from '../models/Analytics';
import { sendSuccess, sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';
import { isPredefinedSkill } from '../utils/predefinedSkills';
import mongoose from 'mongoose';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findById(req.user!._id)
      .populate('offeredSkills', 'name category')
      .populate('desiredSkills', 'name category')
      // Don't populate verifiedSkills - return as ObjectIds (will be serialized as strings)
      .select('-passwordHash')
      .exec();

    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Convert verifiedSkills ObjectIds to strings for frontend
    const userResponse = user.toObject();
    userResponse.verifiedSkills = user.verifiedSkills.map((id) => id.toString());

    sendSuccess(res, userResponse);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { name, bio, location, profilePictureURL } = req.body;
    const updates: Record<string, unknown> = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (profilePictureURL) updates.profilePictureURL = profilePictureURL;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('offeredSkills', 'name category')
      .populate('desiredSkills', 'name category')
      .populate('verifiedSkills', 'name category')
      .select('-passwordHash')
      .exec();

    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    sendSuccess(res, user, SUCCESS_MESSAGES.USER_UPDATED);
  } catch (error) {
    next(error);
  }
};

export const addOfferedSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { skillId } = req.body;

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      sendError(res, ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Validate skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      sendError(res, ERROR_MESSAGES.SKILL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Validate skill is in predefined list
    if (!isPredefinedSkill(skill.name)) {
      sendError(res, ERROR_MESSAGES.SKILL_NOT_PREDEFINED, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Check if skill already in offeredSkills
    if (user.offeredSkills.some((id) => id.toString() === skillId)) {
      sendError(res, 'Skill already in offered skills', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    user.offeredSkills.push(skillId as unknown as mongoose.Types.ObjectId);
    await user.save();

    const updatedUser = await User.findById(req.user!._id)
      .populate('offeredSkills', 'name category')
      .populate('desiredSkills', 'name category')
      .select('-passwordHash')
      .exec();

    sendSuccess(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

export const removeOfferedSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { skillId } = req.params;

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      sendError(res, ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    user.offeredSkills = user.offeredSkills.filter(
      (id) => id.toString() !== skillId
    );
    await user.save();

    const updatedUser = await User.findById(req.user!._id)
      .populate('offeredSkills', 'name category')
      .populate('desiredSkills', 'name category')
      .select('-passwordHash')
      .exec();

    sendSuccess(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

export const addDesiredSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { skillId } = req.body;

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      sendError(res, ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Validate skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      sendError(res, ERROR_MESSAGES.SKILL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Validate skill is in predefined list
    if (!isPredefinedSkill(skill.name)) {
      sendError(res, ERROR_MESSAGES.SKILL_NOT_PREDEFINED, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Check if skill already in desiredSkills
    if (user.desiredSkills.some((id) => id.toString() === skillId)) {
      sendError(res, 'Skill already in desired skills', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Check if user is already offering this skill
    if (user.offeredSkills.some((id) => id.toString() === skillId)) {
      sendError(res, 'You cannot add a skill you are already offering to your wishlist', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    user.desiredSkills.push(skillId as unknown as mongoose.Types.ObjectId);
    await user.save();

    const updatedUser = await User.findById(req.user!._id)
      .populate('offeredSkills', 'name category')
      .populate('desiredSkills', 'name category')
      .select('-passwordHash')
      .exec();

    sendSuccess(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

export const removeDesiredSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { skillId } = req.params;

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      sendError(res, ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    user.desiredSkills = user.desiredSkills.filter(
      (id) => id.toString() !== skillId
    );
    await user.save();

    const updatedUser = await User.findById(req.user!._id)
      .populate('offeredSkills', 'name category')
      .populate('desiredSkills', 'name category')
      .select('-passwordHash')
      .exec();

    sendSuccess(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getUserAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const analytics = await Analytics.findOne({ userId: req.user!._id })
      .populate('skillId', 'name category')
      .exec();

    const user = await User.findById(req.user!._id)
      .select('averageRating totalSessionsTaught totalSkillsLearnt ratingsHistory')
      .exec();

    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      return;
    }

    const analyticsData = {
      averageRating: user.averageRating,
      totalSessionsTaught: user.totalSessionsTaught,
      totalSkillsLearnt: user.totalSkillsLearnt,
      ratingsTrend: analytics?.ratingsTrend || [],
      sessionsPerMonth: analytics?.sessionsPerMonth || [],
    };

    sendSuccess(res, analyticsData);
  } catch (error) {
    next(error);
  }
};

