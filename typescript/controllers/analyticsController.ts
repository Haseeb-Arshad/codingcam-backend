import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

export const AnalyticsController = {
  async getDailyStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const stats = await AnalyticsService.getDailyStats(
        userId, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
  
  async getLanguageStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const stats = await AnalyticsService.getLanguageStats(
        userId, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
  
  async getProjectStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const stats = await AnalyticsService.getProjectStats(
        userId, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};