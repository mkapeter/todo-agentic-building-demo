/**
 * Todo App Backend Server
 * 
 * Express server with centralized logging, security middleware,
 * and comprehensive error handling.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import logging utilities
import logger, { logError } from './utils/logger';
import {
  requestLogger,
  responseLogger,
  errorLogger,
  securityLogger,
  performanceMonitor,
  healthCheckLogger,
} from './middleware/logging';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (order matters!)
app.use(healthCheckLogger);
app.use(requestLogger);
app.use(responseLogger);
app.use(securityLogger);
app.use(performanceMonitor);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes (to be implemented)
app.use('/api/todos', (req, res) => {
  res.json({ message: 'Todo routes coming soon', requestId: req.requestId });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    requestId: req.requestId,
  });
});

// Error handling middleware (must be last)
app.use(errorLogger);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log the error
  logError(err, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
  });

  // Send error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    requestId: req.requestId,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logError(err, { type: 'uncaughtException' });
  logger.error('Uncaught Exception, shutting down...');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logError(new Error(`Unhandled Rejection: ${reason}`), {
    type: 'unhandledRejection',
    promise: promise.toString(),
  });
  logger.error('Unhandled Rejection, shutting down...');
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid: process.pid,
  });
});

export default app;