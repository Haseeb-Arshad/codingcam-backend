import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of project name per user
ProjectSchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
