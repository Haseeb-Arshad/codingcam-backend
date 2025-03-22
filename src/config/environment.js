const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wakatime',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
}; 