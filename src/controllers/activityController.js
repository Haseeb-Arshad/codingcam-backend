const { ActivityService } = require('../services/activityService');
const Logger = require('../utils/logger');
const CodingSession = require('../models/CodingSession');

const ActivityController = {
  async recordActivity(req, res) {
    console.log("RECORDING ACTIVITY: ", req.body);
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const {
        project_name,
        language_name,
        editor,
        platform,
        file_path,
        line_count,
        cursor_position,
        duration_seconds,
        started_at,
        ended_at
      } = req.body;

      const activity = await ActivityService.recordActivity({
        userId: userId,
        projectName: project_name,
        languageName: language_name,
        editor,
        platform,
        filePath: file_path,
        lineCount: line_count,
        cursorPosition: cursor_position,
        durationSeconds: duration_seconds,
        startedAt: new Date(started_at),
        endedAt: new Date(ended_at)
      });

      res.status(201).json(activity);
    } catch (error) {
      Logger.error('Error recording activity', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async recordSession(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const {
        session_id,
        start_time,
        end_time,
        duration_seconds,
        files_count,
        languages,
        files,
        platform,
        editor,
        is_offline_sync,
        is_periodic_update
      } = req.body;
      
      // If this is a periodic update for an active session, handle differently
      if (is_periodic_update) {
        return await this.handlePeriodicSessionUpdate(req, res);
      }
      
      // Record the session using the ActivityService
      const session = await ActivityService.recordSession({
        userId,
        sessionId: session_id,
        startTime: new Date(start_time),
        endTime: new Date(end_time),
        durationSeconds: duration_seconds,
        filesCount: files_count,
        languages,
        files,
        platform,
        editor,
        isOfflineSync: is_offline_sync || false
      });
      
      Logger.info(`Recorded coding session for user ${userId}: ${session_id}, duration: ${duration_seconds}s`);
      
      res.status(201).json(session);
    } catch (error) {
      Logger.error('Error recording session', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  /**
   * Handles periodic updates for active sessions
   * Updates the session data without creating a new session
   */
  async handlePeriodicSessionUpdate(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const {
        session_id,
        start_time,
        end_time,
        duration_seconds,
        files_count,
        languages,
        files,
        platform,
        editor
      } = req.body;
      
      // Check if the session exists
      const existingSession = await CodingSession.findOne({ 
        sessionId: session_id,
        userId: userId 
      });
      
      if (!existingSession) {
        // If the session doesn't exist, create it as a regular session
        Logger.info(`Periodic update for non-existent session ${session_id}, creating new session`);
        
        const session = await ActivityService.recordSession({
          userId,
          sessionId: session_id,
          startTime: new Date(start_time),
          endTime: new Date(end_time),
          durationSeconds: duration_seconds,
          filesCount: files_count,
          languages,
          files,
          platform,
          editor,
          isOfflineSync: false
        });
        
        return res.status(201).json(session);
      }
      
      // Update the existing session with new data
      existingSession.endTime = new Date(end_time);
      existingSession.durationSeconds = duration_seconds;
      existingSession.filesCount = files_count;
      
      // Merge language data
      for (const [lang, seconds] of Object.entries(languages || {})) {
        if (existingSession.languages.has(lang)) {
          // Update existing language
          existingSession.languages.set(lang, seconds);
        } else {
          // Add new language
          existingSession.languages.set(lang, seconds);
        }
      }
      
      // Merge file data
      for (const [filePath, fileData] of Object.entries(files || {})) {
        if (existingSession.files.has(filePath)) {
          // Update existing file
          const existingFile = existingSession.files.get(filePath);
          existingFile.edits = fileData.edits || existingFile.edits;
          existingFile.duration = fileData.duration || existingFile.duration;
          existingFile.keystrokes = fileData.keystrokes || existingFile.keystrokes;
          existingFile.lines = fileData.lines || existingFile.lines;
          existingSession.files.set(filePath, existingFile);
        } else {
          // Add new file
          existingSession.files.set(filePath, fileData);
        }
      }
      
      // Save the updated session
      await existingSession.save();
      
      Logger.info(`Updated session ${session_id} from periodic update`);
      
      res.status(200).json({ 
        message: 'Session updated successfully',
        sessionId: session_id
      });
    } catch (error) {
      Logger.error('Error handling periodic session update', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async getUserActivities(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      const activities = await ActivityService.getUserActivities(userId, limit, offset);
      
      res.status(200).json(activities);
    } catch (error) {
      Logger.error('Error getting user activities', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async getUserSessions(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
      
      const sessions = await ActivityService.getUserSessions(userId, {
        limit,
        offset,
        startDate,
        endDate
      });
      
      res.status(200).json(sessions);
    } catch (error) {
      Logger.error('Error getting user sessions', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { ActivityController }; 