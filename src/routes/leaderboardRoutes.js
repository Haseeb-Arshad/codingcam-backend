const { Router } = require('express');
const { LeaderboardController } = require('../controllers/leaderboardController');

const router = Router();

router.get('/', LeaderboardController.getLeaderboard);

module.exports = router; 