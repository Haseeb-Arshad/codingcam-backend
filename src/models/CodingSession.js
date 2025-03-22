const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for file activity within a session
const FileActivitySchema = new Schema({
  edits: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  language: {
    type: String,
    required: true
  },
  lines: {
    type: Number,
    default: 0
  },
  keystrokes: {
    type: Number,
    default: 0
  }
});

// Main coding session schema
const CodingSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true
    },
    startTime: {
      type: Date,
      required: true,
      index: true
    },
    endTime: {
      type: Date,
      required: true
    },
    durationSeconds: {
      type: Number,
      required: true
    },
    filesCount: {
      type: Number,
      default: 0
    },
    languages: {
      type: Map,
      of: Number, // Language name to seconds spent
      default: {}
    },
    files: {
      type: Map,
      of: FileActivitySchema, // File path to activity data
      default: {}
    },
    platform: {
      type: String,
      required: true
    },
    editor: {
      type: String,
      required: true
    },
    isOfflineSync: {
      type: Boolean,
      default: false
    },
    metrics: {
      averageKeystrokesPerMinute: {
        type: Number,
        default: 0
      },
      maxKeystrokesPerMinute: {
        type: Number,
        default: 0
      },
      totalKeystrokes: {
        type: Number,
        default: 0
      },
      mostUsedLanguage: {
        type: String,
        default: ''
      },
      mostEditedFile: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient date range queries
CodingSessionSchema.index({ userId: 1, startTime: -1 });

// Calculate metrics before saving
CodingSessionSchema.pre('save', function(next) {
  try {
    // Calculate total keystrokes
    let totalKeystrokes = 0;
    let mostEditedFile = '';
    let maxEdits = 0;
    
    // Find most edited file and count keystrokes
    for (const [filePath, activity] of Object.entries(this.files.toObject())) {
      totalKeystrokes += activity.keystrokes;
      
      if (activity.edits > maxEdits) {
        maxEdits = activity.edits;
        mostEditedFile = filePath;
      }
    }
    
    this.metrics.totalKeystrokes = totalKeystrokes;
    this.metrics.mostEditedFile = mostEditedFile;
    
    // Calculate keystrokes per minute
    const durationMinutes = this.durationSeconds / 60;
    if (durationMinutes > 0) {
      this.metrics.averageKeystrokesPerMinute = Math.round(totalKeystrokes / durationMinutes);
      this.metrics.maxKeystrokesPerMinute = this.metrics.averageKeystrokesPerMinute * 2; // Just an estimate
    }
    
    // Find most used language
    let maxLanguageTime = 0;
    let mostUsedLanguage = '';
    
    for (const [language, time] of Object.entries(this.languages.toObject())) {
      if (time > maxLanguageTime) {
        maxLanguageTime = time;
        mostUsedLanguage = language;
      }
    }
    
    this.metrics.mostUsedLanguage = mostUsedLanguage;
    
    next();
  } catch (error) {
    console.error('Error calculating session metrics:', error);
    next(error);
  }
});

module.exports = mongoose.model('CodingSession', CodingSessionSchema); 