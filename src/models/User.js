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
    profilePicture: {
      type: String,
      default: '', // URL to default avatar
    },
    country: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      enabled: {
        type: Boolean,
        default: false
      },
      lastUpdated: {
        type: Date
      }
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true, // Allows null values and only applies uniqueness to non-null values
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      desktopNotifications: {
        type: Boolean,
        default: true
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      language: {
        type: String,
        enum: ['en', 'es', 'fr'],
        default: 'en'
      },
      locationTracking: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

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