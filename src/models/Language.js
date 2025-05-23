const mongoose = require('mongoose');
const { Schema } = mongoose;

const LanguageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Language', LanguageSchema); 