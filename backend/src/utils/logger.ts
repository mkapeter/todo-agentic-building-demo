/**
 * Centralized Logging System
 * 
 * This module provides a comprehensive logging solution using Winston
 * with structured logging, multiple transports, and environment-based configuration.
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Log levels configuration
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// Custom log colors for console output
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
} as const;

// Register colors with winston
winston.addColors(LOG_COLORS);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Create logs directory
const logsDir = path.join(process.cwd(), 'logs');

// File transport configuration
const fileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  level: process.env.LOG_LEVEL || 'info',
});

// Error file transport
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
  level: 'error',
});

// HTTP requests file transport
const httpFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  format: logFormat,
  level: 'http',
});

// Create the main logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: LOG_LEVELS,
  format: logFormat,
  defaultMeta: {
    service: 'todo-app-backend',
    version: process.env.npm_package_version || '1.0.0',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    }),
    
    // File transports
    fileTransport,
    errorFileTransport,
    httpFileTransport,
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  ],
});

// Create specialized loggers for different purposes
export const httpLogger = winston.createLogger({
  level: 'http',
  format: logFormat,
  defaultMeta: { service: 'todo-app-backend', type: 'http' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    httpFileTransport,
  ],
});

export const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  defaultMeta: { service: 'todo-app-backend', type: 'error' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    errorFileTransport,
  ],
});

export const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'todo-app-backend', type: 'performance' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
    }),
  ],
});

// Utility functions for structured logging
export const logWithContext = (level: keyof typeof LOG_LEVELS, message: string, context: Record<string, any> = {}) => {
  logger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
};

export const logError = (error: Error, context: Record<string, any> = {}) => {
  errorLogger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
};

export const logPerformance = (operation: string, duration: number, metadata: Record<string, any> = {}) => {
  performanceLogger.info(`Performance: ${operation}`, {
    operation,
    duration,
    durationMs: duration,
    ...metadata,
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
};

export const logHttpRequest = (req: any, res: any, responseTime: number) => {
  httpLogger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });
};

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Received SIGINT, closing logger...');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, closing logger...');
  logger.end();
});

export default logger;