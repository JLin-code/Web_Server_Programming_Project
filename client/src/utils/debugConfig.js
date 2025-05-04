/**
 * Debug configuration utility
 * Controls debug modes across the application
 */

// Determine if we're in development mode
const isDev = import.meta.env.DEV === true;

// Look for explicitly enabled debug flag in environment
const debugEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true';

// Export debug state - only true if both in dev mode AND debug explicitly enabled
export const DEBUG = isDev && debugEnabled;

// Log levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Current log level - defaults to INFO in dev, ERROR in prod
export const CURRENT_LOG_LEVEL = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * Smart logger that respects current log level
 */
export const logger = {
  error: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  trace: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.TRACE) {
      console.log(`[TRACE] ${message}`, ...args);
    }
  }
};

/**
 * Debug component wrapper
 * Only renders debug UI when in debug mode
 */
export const shouldShowDebug = DEBUG;
