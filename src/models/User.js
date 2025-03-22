const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true, // Allows null values and only applies uniqueness to non-null values
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique API key
UserSchema.methods.generateApiKey = function() {
  const apiKey = crypto.randomBytes(32).toString('hex');
  this.apiKey = apiKey;
  return apiKey;
};

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Generate API key if it doesn't exist
  if (!this.apiKey) {
    this.generateApiKey();
  }
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 