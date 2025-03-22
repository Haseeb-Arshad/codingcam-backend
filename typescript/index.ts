import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes';
import activityRoutes from './src/routes/activityRoutes';
import analyticsRoutes from './src/routes/analyticsRoutes';
import leaderboardRoutes from './src/routes/leaderboardRoutes';
import userRoutes from './src/routes/userRoutes';
import { errorHandler } from './src/middleware/errorHandler';

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler as express.ErrorRequestHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});