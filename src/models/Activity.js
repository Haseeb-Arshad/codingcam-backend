const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    languageName: {
      type: String,
      required: true,
      trim: true,
    },
    editor: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    lineCount: {
      type: Number,
      required: true,
    },
    cursorPosition: {
      type: Number,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ActivitySchema.index({ user: 1, startedAt: -1 });
ActivitySchema.index({ user: 1, projectName: 1 });
ActivitySchema.index({ user: 1, languageName: 1 });

module.exports = mongoose.model('Activity', ActivitySchema); 