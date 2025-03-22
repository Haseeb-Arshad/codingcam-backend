const { AnalyticsService } = require('../services/analyticsService');

const LeaderboardController = {
  async getLeaderboard(req, res) {
    try {
      const { startDate, endDate, limit } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const leaderboard = await AnalyticsService.getLeaderboard(
        new Date(startDate),
        new Date(endDate),
        limit ? parseInt(limit) : 10
      );
      
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { LeaderboardController }; 