const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Language = require('../models/Language');
const DailySummary = require('../models/DailySummary');
const CodingSession = require('../models/CodingSession');
const { startOfDay, endOfDay } = require('date-fns');
const Logger = require('../utils/logger');

const ActivityService = {
  async recordActivity(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activityData = {
        user: data.userId,
        projectName: data.projectName,
        languageName: data.languageName,
        editor: data.editor,
        platform: data.platform,
        filePath: data.filePath,
        lineCount: data.lineCount,
        cursorPosition: data.cursorPosition,
        durationSeconds: data.durationSeconds,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
      };

      // Handle project
      if (data.projectName) {
        let project = await Project.findOne({ 
          name: data.projectName, 
          user: data.userId 
        }).session(session);

        if (!project) {
          project = await Project.create([{
            name: data.projectName,
            user: data.userId
          }], { session });
          project = project[0];
        }

        activityData.project = project._id;
      }

      // Handle language
      if (data.languageName) {
        let language = await Language.findOne({ 
          name: data.languageName 
        }).session(session);

        if (!language) {
          language = await Language.create([{
            name: data.languageName
          }], { session });
          language = language[0];
        }

        activityData.language = language._id;
      }

      // Create activity
      const activity = await Activity.create([activityData], { session });
      console.log("CREATED ACTIVITY: ", activity);

      // Update daily summary
      const dateStr = data.startedAt.toISOString().split('T')[0];
      const date = new Date(dateStr);
      
      let dailySummary = await DailySummary.findOne({
        user: data.userId,
        date: {
          $gte: new Date(date),
          $lt: new Date(new Date(date).setDate(date.getDate() + 1))
        }
      }).session(session);

      if (!dailySummary) {
        dailySummary = await DailySummary.create([{
          user: data.userId,
          date,
          totalSeconds: data.durationSeconds,
          languages: data.languageName && activityData.language ? [{
            language: activityData.language,
            seconds: data.durationSeconds
          }] : [],
          projects: data.projectName && activityData.project ? [{
            project: activityData.project,
            seconds: data.durationSeconds
          }] : []
        }], { session });
        dailySummary = dailySummary[0];
      } else {
        // Update total seconds
        dailySummary.totalSeconds += data.durationSeconds;

        // Update language stats
        if (data.languageName && activityData.language) {
          const langIndex = dailySummary.languages.findIndex(
            l => l.language.toString() === activityData.language.toString()
          );

          if (langIndex >= 0) {
            dailySummary.languages[langIndex].seconds += data.durationSeconds;
          } else {
            dailySummary.languages.push({
              language: activityData.language,
              seconds: data.durationSeconds
            });
          }
        }

        // Update project stats
        if (data.projectName && activityData.project) {
          const projIndex = dailySummary.projects.findIndex(
            p => p.project.toString() === activityData.project.toString()
          );

          if (projIndex >= 0) {
            dailySummary.projects[projIndex].seconds += data.durationSeconds;
          } else {
            dailySummary.projects.push({
              project: activityData.project,
              seconds: data.durationSeconds
            });
          }
        }

        await dailySummary.save({ session });
      }
    

      await session.commitTransaction();
      return activity[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getUserActivities(userId, limit = 100, offset = 0) {
    return Activity.find({ user: userId })
      .sort({ startedAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('project', 'name')
      .populate('language', 'name');
  },

  getDailyStats: async function(userId, date) {
    const start = startOfDay(date);
    const end = endOfDay(date);

    const stats = await Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: '$durationSeconds' },
          projects: { 
            $addToSet: '$projectName'
          },
          languages: {
            $addToSet: '$languageName'
          }
        }
      }
    ]);

    return stats[0] || { totalSeconds: 0, projects: [], languages: [] };
  },

  getLanguageStats: async function(userId, startDate, endDate) {
    return Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$languageName',
          totalSeconds: { $sum: '$durationSeconds' }
        }
      },
      {
        $sort: { totalSeconds: -1 }
      }
    ]);
  },
  
  getProjectStats: async function(userId, startDate, endDate) {
    return Activity.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          startedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$projectName',
          totalSeconds: { $sum: '$durationSeconds' }
        }
      },
      {
        $sort: { totalSeconds: -1 }
      }
    ]);
  },

  async recordSession(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      Logger.debug(`Recording coding session for user ${data.userId}, session ${data.sessionId}`);
      
      // Validate required fields
      if (!data.userId || !data.sessionId || !data.startTime || !data.endTime) {
        Logger.error(`Missing required fields for session ${data.sessionId || 'unknown'}`);
        throw new Error('Missing required fields: userId, sessionId, startTime, and endTime are required');
      }
      
      // Check if session with this ID already exists to avoid duplicates
      const existingSession = await CodingSession.findOne({ sessionId: data.sessionId });
      if (existingSession) {
        Logger.info(`Session ${data.sessionId} already exists, skipping`);
        return existingSession;
      }
      
      // Ensure files and languages are valid objects
      const files = data.files || {};
      const languages = data.languages || {};
      
      // Ensure dates are valid Date objects
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        Logger.error(`Invalid date format for session ${data.sessionId}`);
        throw new Error('Invalid date format for startTime or endTime');
      }
      
      // Ensure durationSeconds is a number
      const durationSeconds = typeof data.durationSeconds === 'number' ? 
        data.durationSeconds : 
        Math.floor((endTime - startTime) / 1000);
      
      // Create new Maps for Mongoose
      const filesMap = new mongoose.Types.Map();
      const languagesMap = new mongoose.Types.Map();
      
      // Process files
      try {
        Object.entries(files).forEach(([filePath, fileData]) => {
          // Sanitize file path
          const sanitizedPath = filePath.replace(/\\/g, '/');
          filesMap.set(sanitizedPath, {
            edits: parseInt(fileData.edits) || 0,
            duration: parseInt(fileData.duration) || 0,
            language: fileData.language || 'unknown',
            lines: parseInt(fileData.lines) || 0,
            keystrokes: parseInt(fileData.keystrokes) || 0
          });
        });
      } catch (e) {
        Logger.warn(`Error processing files data: ${e.message}`);
      }
      
      // Process languages
      try {
        Object.entries(languages).forEach(([language, seconds]) => {
          if (language && !isNaN(Number(seconds))) {
            languagesMap.set(language, Number(seconds));
          }
        });
      } catch (e) {
        Logger.warn(`Error processing language data: ${e.message}`);
      }
      
      // Prepare session data with defaults for optional fields
      const sessionData = {
        userId: data.userId,
        sessionId: data.sessionId,
        startTime,
        endTime,
        durationSeconds,
        filesCount: data.filesCount || Object.keys(files).length,
        languages: languagesMap,
        files: filesMap,
        platform: data.platform || 'unknown',
        editor: data.editor || 'unknown',
        isOfflineSync: !!data.isOfflineSync
      };
      
      // Create coding session
      const codingSession = await CodingSession.create([sessionData], { session });
      
      // Update daily summary with session data
      const dateStr = startTime.toISOString().split('T')[0];
      const date = new Date(dateStr);
      
      let dailySummary = await DailySummary.findOne({
        user: data.userId,
        date: {
          $gte: new Date(date),
          $lt: new Date(new Date(date).setDate(date.getDate() + 1))
        }
      }).session(session);
      
      // If no daily summary exists for this date, create one
      if (!dailySummary) {
        const languageEntries = [];
        
        // Ensure languages are properly formatted for array storage
        try {
          languagesMap.forEach((seconds, name) => {
            if (name && typeof seconds === 'number') {
              languageEntries.push({
                name,
                seconds
              });
            }
          });
        } catch (e) {
          Logger.warn(`Error processing languages for daily summary: ${e.message}`);
        }
        
        dailySummary = await DailySummary.create([{
          user: data.userId,
          date,
          totalSeconds: durationSeconds,
          languages: languageEntries,
          projects: []
        }], { session });
        dailySummary = dailySummary[0];
      } else {
        // Update total seconds
        dailySummary.totalSeconds += durationSeconds;
        
        // Update language stats
        try {
          languagesMap.forEach((seconds, name) => {
            if (!name || typeof seconds !== 'number') return;
            
            const langIndex = dailySummary.languages.findIndex(l => l.name === name);
            
            if (langIndex >= 0) {
              dailySummary.languages[langIndex].seconds += seconds;
            } else {
              dailySummary.languages.push({
                name,
                seconds
              });
            }
          });
        } catch (e) {
          Logger.warn(`Error updating language stats: ${e.message}`);
        }
        
        await dailySummary.save({ session });
      }
      
      await session.commitTransaction();
      return codingSession[0];
    } catch (error) {
      await session.abortTransaction();
      Logger.error(`Error recording session: ${error.message}`, error);
      throw error;
    } finally {
      session.endSession();
    }
  },
  
  async getUserSessions(userId, options = {}) {
    const { limit = 100, offset = 0, startDate, endDate } = options;
    
    let query = { userId };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.startTime = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.startTime = { $gte: startDate };
    } else if (endDate) {
      query.startTime = { $lte: endDate };
    }
    
    return CodingSession.find(query)
      .sort({ startTime: -1 })
      .skip(offset)
      .limit(limit);
  }
};

module.exports = { ActivityService }; 