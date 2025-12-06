/**
 * Simple logger utility for consistent logging across the application
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message, ...args) => {
    console.log(`${colors.blue}[INFO]${colors.reset} [${getTimestamp()}] ${message}`, ...args);
  },

  success: (message, ...args) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} [${getTimestamp()}] ${message}`, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} [${getTimestamp()}] ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`${colors.red}[ERROR]${colors.reset} [${getTimestamp()}] ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.magenta}[DEBUG]${colors.reset} [${getTimestamp()}] ${message}`, ...args);
    }
  },

  // Log API requests
  request: (method, path, ...args) => {
    console.log(`${colors.cyan}[REQUEST]${colors.reset} [${getTimestamp()}] ${method} ${path}`, ...args);
  },
};

module.exports = logger;
