/**
 * Express Logging Middleware
 * 
 * This middleware provides comprehensive request/response logging,
 * performance monitoring, and error tracking for Express routes.
 */

import { Request, Response, NextFunction } from 'express';
import logger, { logHttpRequest, logError, logPerformance } from '../utils/logger';

// Request ID generator for tracing requests
let requestIdCounter = 0;
const generateRequestId = () => `req_${Date.now()}_${++requestIdCounter}`;

// Extend Express Request interface to include request ID
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Request logging middleware
 * Logs incoming requests with timing and metadata
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique request ID
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming Request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined,
    },
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params,
  });

  next();
};

/**
 * Response logging middleware
 * Logs outgoing responses with timing and status
 */
export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to capture response data
  res.send = function(data: any) {
    const responseTime = Date.now() - req.startTime;
    
    // Log response
    logger.info('Outgoing Response', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      responseSize: data ? JSON.stringify(data).length : 0,
      headers: res.getHeaders(),
    });

    // Log performance if response time is significant
    if (responseTime > 1000) {
      logPerformance(`Slow Response: ${req.method} ${req.url}`, responseTime, {
        requestId: req.requestId,
        statusCode: res.statusCode,
      });
    }

    // Log HTTP request for external monitoring
    logHttpRequest(req, res, responseTime);

    return originalSend.call(this, data);
  };

  // Override res.json to capture JSON response data
  res.json = function(data: any) {
    const responseTime = Date.now() - req.startTime;
    
    // Log response
    logger.info('Outgoing JSON Response', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      responseSize: data ? JSON.stringify(data).length : 0,
      headers: res.getHeaders(),
    });

    // Log performance if response time is significant
    if (responseTime > 1000) {
      logPerformance(`Slow JSON Response: ${req.method} ${req.url}`, responseTime, {
        requestId: req.requestId,
        statusCode: res.statusCode,
      });
    }

    // Log HTTP request for external monitoring
    logHttpRequest(req, res, responseTime);

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Error logging middleware
 * Logs errors with full context and stack traces
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const responseTime = Date.now() - req.startTime;

  // Log error with full context
  logError(err, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    statusCode: res.statusCode || 500,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
    query: req.query,
    params: req.params,
    stack: err.stack,
  });

  // Log performance for error responses
  logPerformance(`Error Response: ${req.method} ${req.url}`, responseTime, {
    requestId: req.requestId,
    error: err.message,
    statusCode: res.statusCode || 500,
  });

  next(err);
};

/**
 * Security logging middleware
 * Logs security-related events and suspicious activities
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
  ];

  const url = req.url.toLowerCase();
  const userAgent = req.get('User-Agent')?.toLowerCase() || '';

  // Check for suspicious patterns in URL
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      logger.warn('Suspicious Request Detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        userAgent,
        ip: req.ip || req.connection.remoteAddress,
        pattern: pattern.toString(),
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'zap',
    'burp',
  ];

  for (const agent of suspiciousUserAgents) {
    if (userAgent.includes(agent)) {
      logger.warn('Suspicious User Agent Detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        userAgent,
        ip: req.ip || req.connection.remoteAddress,
        detectedAgent: agent,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  next();
};

/**
 * Performance monitoring middleware
 * Monitors and logs performance metrics
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Log performance metrics
    logPerformance(`Request: ${req.method} ${req.url}`, duration, {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    });

    // Alert on slow requests
    if (duration > 5000) {
      logger.warn('Slow Request Alert', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration,
        statusCode: res.statusCode,
        memoryUsage: process.memoryUsage(),
      });
    }
  });

  next();
};

/**
 * Health check logging middleware
 * Logs health check requests separately to reduce noise
 */
export const healthCheckLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.url === '/api/health' || req.url === '/health') {
    // Log health checks at debug level to reduce noise
    logger.debug('Health Check Request', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
    });
  }
  
  next();
};

export default {
  requestLogger,
  responseLogger,
  errorLogger,
  securityLogger,
  performanceMonitor,
  healthCheckLogger,
};