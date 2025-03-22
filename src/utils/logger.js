const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure the Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'codingcam-backend' },
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add a stream for Morgan HTTP logging
logger.stream = {
  write: (message) => logger.info(message.trim())
};

// Convenience methods to log auth-related events
const Logger = {
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  
  error: (message, error = null, meta = {}) => {
    if (error) {
      meta.error = error.message;
      meta.stack = error.stack;
    }
    logger.error(message, meta);
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  
  // Activity logging for users
  logActivity: (userId, action, details = {}) => {
    logger.info(`User Activity: ${action}`, {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  // API key usage logging
  logApiKeyUsage: (apiKey, userId, endpoint, status) => {
    logger.info(`API Key Used: ${status}`, {
      apiKey: apiKey.substring(0, 8) + '...',  // Log only part of the API key for security
      userId,
      endpoint,
      status,
      timestamp: new Date().toISOString()
    });
  },
  
  // Authentication logging
  logAuthEvent: (userId, event, success, details = {}) => {
    logger.info(`Auth Event: ${event} - ${success ? 'Success' : 'Failed'}`, {
      userId,
      event,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  // HTTP request logger middleware for Express
  httpLogger: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`HTTP ${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: duration + 'ms',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    });
    
    next();
  }
};

module.exports = Logger; 