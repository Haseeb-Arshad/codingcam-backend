const { AnalyticsService } = require('../services/analyticsService');

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
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { AnalyticsController }; 