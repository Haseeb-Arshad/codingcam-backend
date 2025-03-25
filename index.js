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
const net = require('net');
 
// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());

// Increase JSON body size limit for handling larger images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

// Function to find an available port
const findAvailablePort = (startPort, callback) => {
  const server = net.createServer();
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Port is in use, try the next one
      findAvailablePort(startPort + 1, callback);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(startPort, () => {
    const port = server.address().port;
    server.once('close', () => {
      callback(port);
    });
    server.close();
  });
};

// Start the server on an available port
const DEFAULT_PORT = parseInt(process.env.PORT || '3001', 10);
findAvailablePort(DEFAULT_PORT, (port) => {
  app.listen(port, () => {
    Logger.info(`Backend server running on http://localhost:${port}`);
    Logger.info(`Frontend API available at http://localhost:${port}/frontend`);
    Logger.info(`Extension API available at http://localhost:${port}/api/extension`);
  });
}); 