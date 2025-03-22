import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ActivityService } from '../services/activityService';

export const ActivityController = {
  async recordActivity(req: AuthRequest, res: Response): Promise<void> {
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
      res.status(500).json({ message: (error as Error).message });
    }
  },
  
  async getUserActivities(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const activities = await ActivityService.getUserActivities(userId, limit, offset);
      
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};