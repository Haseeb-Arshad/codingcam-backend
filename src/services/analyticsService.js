const mongoose = require('mongoose');
const DailySummary = require('../models/DailySummary');
const User = require('../models/User');

const AnalyticsService = {
  async getDailyStats(userId, startDate, endDate) {
    return DailySummary.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
  },
  
  async getLanguageStats(userId, startDate, endDate) {
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
        name: lang.language.name,
        seconds: lang.seconds
      }))
    }));
  },
  
  async getProjectStats(userId, startDate, endDate) {
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
        name: proj.project.name,
        seconds: proj.seconds
      }))
    }));
  },
  
  async getLeaderboard(startDate, endDate, limit = 10) {
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

module.exports = { AnalyticsService }; 