import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export const LeaderboardController = {
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const leaderboard = await AnalyticsService.getLeaderboard(
        new Date(startDate as string),
        new Date(endDate as string),
        limit ? parseInt(limit as string) : 10
      );
      
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};