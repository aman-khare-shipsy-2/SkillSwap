import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  offeredSkillId: mongoose.Types.ObjectId;
  requestedSkillId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  forfeitedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SkillRequestSchema = new Schema<ISkillRequest>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
    },
    offeredSkillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Offered skill ID is required'],
    },
    requestedSkillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Requested skill ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    forfeitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Prevent self-requests and set expiration date
SkillRequestSchema.pre('save', function (this: ISkillRequest) {
  // Prevent self-requests
  if (this.senderId.toString() === this.receiverId.toString()) {
    throw new Error('Cannot send request to yourself');
  }
  
  // Set expiration date (30 days from creation) if new
  if (this.isNew && !this.expiresAt) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    this.expiresAt = expirationDate;
  }
});

// Indexes
SkillRequestSchema.index({ senderId: 1 });
SkillRequestSchema.index({ receiverId: 1 });
SkillRequestSchema.index({ status: 1 });
SkillRequestSchema.index({ expiresAt: 1 }); // For finding expired requests
SkillRequestSchema.index({ senderId: 1, receiverId: 1 }); // Compound index
SkillRequestSchema.index({ createdAt: -1 }); // For sorting by newest
SkillRequestSchema.index({ senderId: 1, status: 1, createdAt: -1 }); // Compound index for sent requests
SkillRequestSchema.index({ receiverId: 1, status: 1, createdAt: -1 }); // Compound index for received requests
SkillRequestSchema.index({ status: 1, expiresAt: 1 }); // Compound index for expired requests query

const SkillRequest = mongoose.model<ISkillRequest>('SkillRequest', SkillRequestSchema);

export default SkillRequest;

