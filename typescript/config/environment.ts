import dotenv from 'dotenv';
dotenv.config();

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wakatime',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
};