const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema(
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

module.exports = mongoose.model('Project', ProjectSchema); 