import mongoose, { Document, Schema } from 'mongoose';

export interface IDailySummary extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  totalSeconds: number;
  languages: {
    language: mongoose.Types.ObjectId;
    seconds: number;
  }[];
  projects: {
    project: mongoose.Types.ObjectId;
    seconds: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalSeconds: {
      type: Number,
      default: 0,
    },
    languages: [
      {
        language: {
          type: Schema.Types.ObjectId,
          ref: 'Language',
        },
        seconds: {
          type: Number,
          default: 0,
        },
      },
    ],
    projects: [
      {
        project: {
          type: Schema.Types.ObjectId,
          ref: 'Project',
        },
        seconds: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of user and date
DailySummarySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);
