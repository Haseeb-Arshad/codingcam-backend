const mongoose = require('mongoose');
const DailySummary = require('../models/DailySummary');
const CodingSession = require('../models/CodingSession');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Logger = require('../utils/logger');

const AnalyticsService = {
  /**
   * Get daily statistics for a user within a date range
   */
  async getDailyStats(userId, startDate, endDate) {
    try {
      // Mock data for development
      const days = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalSeconds = 0;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const daySeconds = Math.floor(Math.random() * 72000) + 3600; // Random time between 1-20 hours
        totalSeconds += daySeconds;
        
        days.push({
          date: d.toISOString(),
          totalSeconds: daySeconds,
          languages: [
            { name: 'JavaScript', seconds: Math.floor(Math.random() * 36000) },
            { name: 'Python', seconds: Math.floor(Math.random() * 18000) },
            { name: 'TypeScript', seconds: Math.floor(Math.random() * 14400) }
          ],
          projects: [
            { name: 'Project A', seconds: Math.floor(Math.random() * 18000) },
            { name: 'Project B', seconds: Math.floor(Math.random() * 14400) }
          ]
        });
      }
      
      const numberOfDays = days.length;
      const averageSecondsPerDay = totalSeconds / numberOfDays;
      
      return { 
        dailyStats: days,
        totalSeconds,
        averageSecondsPerDay,
        keystrokeCount: Math.floor(Math.random() * 1000000),
        sessionCount: Math.floor(Math.random() * 50)
      };
    } catch (error) {
      Logger.error('Error in getDailyStats:', error);
      throw new Error('Failed to fetch daily statistics');
    }
  },
  
  /**
   * Get language statistics for a user within a date range
   */
  async getLanguageStats(userId, startDate, endDate) {
    try {
      // Mock data for development
      return {
        languages: [
          { name: 'JavaScript', seconds: 72000, percentage: 40 },
          { name: 'Python', seconds: 54000, percentage: 30 },
          { name: 'TypeScript', seconds: 36000, percentage: 20 },
          { name: 'Java', seconds: 18000, percentage: 10 }
        ]
      };
    } catch (error) {
      Logger.error('Error in getLanguageStats:', error);
      throw new Error('Failed to fetch language statistics');
    }
  },
  
  /**
   * Get project statistics for a user within a date range
   */
  async getProjectStats(userId, startDate, endDate) {
    try {
      // Mock data for development
      return {
        projects: [
          { 
            name: 'Project A', 
            seconds: 72000,
            lastActive: new Date().toISOString()
          },
          { 
            name: 'Project B', 
            seconds: 54000,
            lastActive: new Date(Date.now() - 3600000).toISOString()
          },
          { 
            name: 'Project C', 
            seconds: 36000,
            lastActive: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      };
    } catch (error) {
      Logger.error('Error in getProjectStats:', error);
      throw new Error('Failed to fetch project statistics');
    }
  },
  
  /**
   * Get detailed profile data for a user
   */
  async getProfileData(userId) {
    try {
      // Get user data
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get activity summary
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get daily activity data for the last 30 days
      const dailyActivity = await this.getDailyStats(userId, thirtyDaysAgo, new Date());
      
      // Get language data
      const languageData = await this.getLanguageStats(userId, thirtyDaysAgo, new Date());
      
      // Get most used editors and platforms
      const toolsData = await CodingSession.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            startTime: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              editor: "$editor",
              platform: "$platform"
            },
            totalSeconds: { $sum: "$durationSeconds" }
          }
        },
        {
          $group: {
            _id: "$_id.editor",
            platform: { $first: "$_id.platform" },
            totalSeconds: { $sum: "$totalSeconds" }
          }
        },
        {
          $sort: { totalSeconds: -1 }
        }
      ]);
      
      const totalToolTime = toolsData.reduce((sum, tool) => sum + tool.totalSeconds, 0) || 1;
      
      const tools = toolsData.map(tool => ({
        name: tool._id,
        platform: tool.platform,
        totalSeconds: tool.totalSeconds,
        percentage: Math.round((tool.totalSeconds / totalToolTime) * 100)
      }));
      
      // Calculate current streak
      let currentStreak = 0;
      const sortedDailyStats = [...dailyActivity.dailyStats].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      
      const today = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < sortedDailyStats.length; i++) {
        const stat = sortedDailyStats[i];
        
        // Skip today if it's the first day
        if (i === 0 && stat.date === today) {
          continue;
        }
        
        if (stat.totalSeconds > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return {
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName || user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          country: user.country,
          timezone: user.timezone,
          joinDate: user.createdAt
        },
        activity: {
          totalCodingTime: dailyActivity.totalSeconds,
          dailyAverage: dailyActivity.averageSecondsPerDay,
          keystrokeCount: dailyActivity.keystrokeCount,
          sessionCount: dailyActivity.sessionCount,
          currentStreak,
          dailyStats: dailyActivity.dailyStats
        },
        languages: languageData.languages,
        tools,
        lastActive: sortedDailyStats[0]?.date
      };
    } catch (error) {
      Logger.error('Error in getProfileData:', error);
      throw new Error('Failed to fetch profile data');
    }
  },
  
  async getLeaderboard(startDate, endDate, limit = 10) {
    try {
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
            profilePicture: '$user.profilePicture',
            totalSeconds: 1
          }
        }
      ];
      
      return DailySummary.aggregate(pipeline);
    } catch (error) {
      Logger.error('Error in getLeaderboard:', error);
      throw new Error('Failed to fetch leaderboard data');
    }
  }
};

module.exports = { AnalyticsService }; 