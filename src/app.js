const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/environment');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware needs to be registered after all other routes and middleware
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 