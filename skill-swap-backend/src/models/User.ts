import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profilePictureURL?: string;
  bio?: string;
  location?: string;
  offeredSkills: mongoose.Types.ObjectId[];
  desiredSkills: mongoose.Types.ObjectId[];
  averageRating: number;
  verifiedSkills: mongoose.Types.ObjectId[];
  totalSessionsTaught: number;
  totalSkillsLearnt: number;
  ratingsHistory: Array<{
    rating: number;
    skill: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    timestamp: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const RatingHistorySchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    skill: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profilePictureURL: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    offeredSkills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    desiredSkills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    verifiedSkills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    totalSessionsTaught: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSkillsLearnt: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingsHistory: {
      type: [RatingHistorySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ offeredSkills: 1 });
UserSchema.index({ desiredSkills: 1 });
UserSchema.index({ averageRating: -1 }); // For sorting by rating
// Note: Cannot create compound index on parallel arrays (offeredSkills and desiredSkills)
// Use separate queries or text search for skill exchange search
UserSchema.index({ isActive: 1, averageRating: -1 }); // Compound index for active users sorted by rating

// Password hashing middleware (only if password is modified)
UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('passwordHash')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Virtual for user's full profile (can be used for API responses)
UserSchema.virtual('profile').get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profilePictureURL: this.profilePictureURL,
    bio: this.bio,
    location: this.location,
    averageRating: this.averageRating,
    totalSessionsTaught: this.totalSessionsTaught,
    totalSkillsLearnt: this.totalSkillsLearnt,
    isActive: this.isActive,
  };
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;

