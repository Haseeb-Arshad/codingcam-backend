import mongoose from 'mongoose';
import DailySummary from '../models/DailySummary';
import User from '../models/User';

export const AnalyticsService = {
  async getDailyStats(userId: string, startDate: Date, endDate: Date) {
    return DailySummary.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
  },
  
  async getLanguageStats(userId: string, startDate: Date, endDate: Date) {
    const summaries = await DailySummary.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('languages.language', 'name');
    
    return summaries.map(summary => ({
      date: summary.date,
      languages: summary.languages.map(lang => ({
        name: (lang.language as any).name,
        seconds: lang.seconds
      }))
    }));
  },
  
  async getProjectStats(userId: string, startDate: Date, endDate: Date) {
    const summaries = await DailySummary.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('projects.project', 'name');
    
    return summaries.map(summary => ({
      date: summary.date,
      projects: summary.projects.map(proj => ({
        name: (proj.project as any).name,
        seconds: proj.seconds
      }))
    }));
  },
  
  async getLeaderboard(startDate: Date, endDate: Date, limit = 10) {
    const pipeline = [
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$user',
          totalSeconds: { $sum: '$totalSeconds' }
        }
      },
      {
        $sort: { totalSeconds: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          fullName: '$user.fullName',
          country: '$user.country',
          totalSeconds: 1
        }
      }
    ];
    
    return DailySummary.aggregate(pipeline);
  }
};