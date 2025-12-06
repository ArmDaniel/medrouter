const logger = require('../config/logger');

/**
 * Middleware to log all incoming requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
  logger.request(req.method, req.path, {
    query: req.query,
    body: req.method !== 'GET' && req.body ? '...' : undefined, // Don't log full body for security
  });

  // Log the response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(
      `${statusColor}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
