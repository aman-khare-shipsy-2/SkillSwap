import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  ratedUserId: mongoose.Types.ObjectId;
  ratedById: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  score: number;
  comment?: string;
  sessionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    ratedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rated user ID is required'],
    },
    ratedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rater ID is required'],
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill ID is required'],
    },
    score: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Prevent self-rating
RatingSchema.pre('save', function (this: IRating) {
  if (this.ratedUserId.toString() === this.ratedById.toString()) {
    throw new Error('Cannot rate yourself');
  }
});

// Indexes
RatingSchema.index({ ratedUserId: 1 });
RatingSchema.index({ skillId: 1 });
RatingSchema.index({ sessionId: 1 });
RatingSchema.index({ ratedUserId: 1, skillId: 1 }); // For skill-specific ratings
RatingSchema.index({ ratedUserId: 1, sessionId: 1 }, { unique: true }); // Prevent duplicate ratings for same session
RatingSchema.index({ createdAt: -1 }); // For sorting by newest

const Rating = mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;

