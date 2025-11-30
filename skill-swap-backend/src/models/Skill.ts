import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Skill name must be at least 2 characters'],
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SkillSchema.index({ name: 1 }, { unique: true });
SkillSchema.index({ category: 1 });
SkillSchema.index({ name: 'text', description: 'text' }); // Text search index

const Skill = mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;

