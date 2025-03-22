const mongoose = require('mongoose');
const { Schema } = mongoose;

const DailySummarySchema = new Schema(
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

module.exports = mongoose.model('DailySummary', DailySummarySchema); 