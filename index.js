const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const userRoutes = require('./src/routes/userRoutes');
const extensionRoutes = require('./src/routes/extensionRoutes');
const frontendRoutes = require('./src/routes/frontendRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');
const connectDB = require('./src/config/database');
const Logger = require('./src/utils/logger');
 
// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Add HTTP request logging
app.use(Logger.httpLogger);

// Mount API routers
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/extension', extensionRoutes);

// Mount frontend router
app.use('/frontend', frontendRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  Logger.info(`Backend server running on http://localhost:${PORT}`);
  Logger.info(`Frontend API available at http://localhost:${PORT}/frontend`);
  Logger.info(`Extension API available at http://localhost:${PORT}/api/extension`);
}); 