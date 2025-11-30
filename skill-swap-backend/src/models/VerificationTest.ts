import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  options: string[];
  correctAnswer: string | number;
  userAnswer?: string | number;
}

export interface IVerificationTest extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  score: number;
  status: 'pending' | 'passed' | 'failed';
  attemptedAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  calculateScore(): number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (options: string[]) {
          return options.length >= 2;
        },
        message: 'Question must have at least 2 options',
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    userAnswer: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const VerificationTestSchema = new Schema<IVerificationTest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending',
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate score
VerificationTestSchema.methods.calculateScore = function (): number {
  let correctAnswers = 0;
  this.questions.forEach((question: IQuestion) => {
    if (question.userAnswer !== undefined && question.userAnswer === question.correctAnswer) {
      correctAnswers++;
    }
  });
  return correctAnswers;
};

// Pre-save hook to update score and status
// Mongoose 9: async pre-save hooks don't use next callback
VerificationTestSchema.pre('save', async function (this: IVerificationTest) {
  try {
    if (this.isModified('questions')) {
      const totalQuestions = this.questions.length;
      const correctAnswers = this.calculateScore();
      this.score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      // Only auto-update status if it's still pending and all questions are answered
      // Otherwise, let the service layer handle status updates
      if (this.status === 'pending' && this.questions.every(q => q.userAnswer !== undefined)) {
        // Status will be set by service layer, so we don't override it here
        // This prevents conflicts between pre-save hook and service layer
      }
    }
  } catch (error) {
    console.error('Error in VerificationTest pre-save hook:', error);
    // Don't throw - let the save continue
  }
});

// Indexes
VerificationTestSchema.index({ userId: 1 });
VerificationTestSchema.index({ skillId: 1 });
VerificationTestSchema.index({ userId: 1, skillId: 1 }); // Compound index
VerificationTestSchema.index({ status: 1 });
VerificationTestSchema.index({ attemptedAt: -1 }); // For sorting by newest

const VerificationTest = mongoose.model<IVerificationTest>('VerificationTest', VerificationTestSchema);

export default VerificationTest;

