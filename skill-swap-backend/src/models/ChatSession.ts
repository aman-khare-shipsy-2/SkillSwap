import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  type: 'text' | 'image' | 'video' | 'document' | 'link';
  text?: string;
  contentURL?: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  requestId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'document', 'link'],
      required: true,
    },
    text: {
      type: String,
      required: function (this: IMessage) {
        return this.type === 'text' || this.type === 'link';
      },
    },
    contentURL: {
      type: String,
      required: function (this: IMessage) {
        return ['image', 'video', 'document'].includes(this.type);
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillRequest',
      required: true,
      unique: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: {
      type: [MessageSchema],
      default: [],
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Ensure exactly 2 participants
ChatSessionSchema.pre('save', function (this: IChatSession) {
  if (this.participants.length !== 2) {
    throw new Error('Chat session must have exactly 2 participants');
  }
});

// Indexes
ChatSessionSchema.index({ requestId: 1 }, { unique: true });
ChatSessionSchema.index({ participants: 1 });
ChatSessionSchema.index({ 'messages.timestamp': -1 }); // For sorting messages
ChatSessionSchema.index({ updatedAt: -1 }); // For sorting by most recent activity
ChatSessionSchema.index({ participants: 1, endedAt: 1 }); // Compound index for getUserChats query
ChatSessionSchema.index({ participants: 1, updatedAt: -1 }); // Compound index for sorting active chats

const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);

export default ChatSession;

