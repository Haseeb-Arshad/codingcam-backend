import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/environment';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res, next);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;