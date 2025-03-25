const { AnalyticsService } = require('../services/analyticsService');
const Logger = require('../utils/logger');

const AnalyticsController = {
  async getDailyStats(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const stats = await AnalyticsService.getDailyStats(
        userId, 
        new Date(startDate), 
        new Date(endDate)
      );
      
      res.status(200).json(stats);
    } catch (error) {
      Logger.error('Error fetching daily stats:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async getLanguageStats(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const stats = await AnalyticsService.getLanguageStats(
        userId, 
        new Date(startDate), 
        new Date(endDate)
      );
      
      res.status(200).json(stats);
    } catch (error) {
      Logger.error('Error fetching language stats:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async getProjectStats(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const stats = await AnalyticsService.getProjectStats(
        userId, 
        new Date(startDate), 
        new Date(endDate)
      );
      
      res.status(200).json(stats);
    } catch (error) {
      Logger.error('Error fetching project stats:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async getProfileData(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const profileData = await AnalyticsService.getProfileData(userId);
      
      res.status(200).json(profileData);
    } catch (error) {
      Logger.error('Error fetching profile data:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  async getReportData(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      // Get all necessary stats in parallel
      const [dailyStats, languageStats, projectStats] = await Promise.all([
        AnalyticsService.getDailyStats(userId, new Date(startDate), new Date(endDate)),
        AnalyticsService.getLanguageStats(userId, new Date(startDate), new Date(endDate)),
        AnalyticsService.getProjectStats(userId, new Date(startDate), new Date(endDate))
      ]);
      
      // Combine into a comprehensive report
      const reportData = {
        timeframe: {
          startDate,
          endDate
        },
        overview: {
          totalCodingTime: dailyStats.totalSeconds,
          dailyAverage: dailyStats.averageSecondsPerDay,
          keystrokeCount: dailyStats.keystrokeCount,
          sessionCount: dailyStats.sessionCount,
          projectsCount: projectStats.projects.length,
          languagesCount: languageStats.languages.length
        },
        dailyActivity: dailyStats.dailyStats,
        languages: languageStats.languages,
        projects: projectStats.projects,
        generatedAt: new Date()
      };
      
      res.status(200).json(reportData);
    } catch (error) {
      Logger.error('Error generating report data:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { AnalyticsController }; 