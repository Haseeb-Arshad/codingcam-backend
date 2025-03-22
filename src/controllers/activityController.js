const { ActivityService } = require('../services/activityService');
const Logger = require('../utils/logger');

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
        is_offline_sync
      } = req.body;
      
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