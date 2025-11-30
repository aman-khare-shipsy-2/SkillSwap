import mongoose, { Document, Schema } from 'mongoose';

export interface IRatingTrend {
  rating: number;
  skill: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  skillId?: mongoose.Types.ObjectId;
  ratingsTrend: IRatingTrend[];
  sessionsPerMonth: Array<{
    month: string; // Format: "YYYY-MM"
    count: number;
  }>;
  totalRatingAverage: number;
  updatedAt: Date;
}

const RatingTrendSchema = new Schema<IRatingTrend>(
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

const SessionsPerMonthSchema = new Schema(
  {
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    count: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      default: null,
    },
    ratingsTrend: {
      type: [RatingTrendSchema],
      default: [],
      validate: {
        validator: function (trends: IRatingTrend[]) {
          return trends.length <= 20; // Keep only last 20 ratings
        },
        message: 'Ratings trend cannot exceed 20 entries',
      },
    },
    sessionsPerMonth: {
      type: [SessionsPerMonthSchema],
      default: [],
    },
    totalRatingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: false, // We only want updatedAt
  }
);

// Method to update ratings trend (keeps only last 20)
AnalyticsSchema.methods.updateRatingsTrend = function (
  newRating: IRatingTrend
): void {
  this.ratingsTrend.push(newRating);
  if (this.ratingsTrend.length > 20) {
    this.ratingsTrend = this.ratingsTrend.slice(-20); // Keep only last 20
  }
};

// Method to update monthly sessions
AnalyticsSchema.methods.updateMonthlySessions = function (): void {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const monthEntry = this.sessionsPerMonth.find(
    (entry: { month: string; count: number }) => entry.month === currentMonth
  );

  if (monthEntry) {
    monthEntry.count += 1;
  } else {
    this.sessionsPerMonth.push({ month: currentMonth, count: 1 });
  }
};

// Pre-save hook to update updatedAt
// @ts-expect-error - Mongoose 9 type definitions issue with pre-save hooks
AnalyticsSchema.pre('save', function (this: IAnalytics, next: (err?: Error) => void) {
  this.updatedAt = new Date();
  next();
});

// Indexes
AnalyticsSchema.index({ userId: 1 }, { unique: true });
AnalyticsSchema.index({ skillId: 1 });
AnalyticsSchema.index({ updatedAt: -1 }); // For sorting by most recent update

const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;

