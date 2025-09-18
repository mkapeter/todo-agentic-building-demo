/**
 * Frontend Centralized Logging System
 * 
 * This module provides a comprehensive logging solution for the React frontend
 * with console logging, remote logging, performance monitoring, and error tracking.
 */

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  url?: string;
  userAgent?: string;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enablePerformance: boolean;
  enableErrorTracking: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
  enablePerformance: true,
  enableErrorTracking: true,
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
};

class FrontendLogger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;
  private performanceEntries: PerformanceEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
    this.startFlushTimer();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID for logging context
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, context: Record<string, any> = {}): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Remote logging
    if (this.config.enableRemote && this.shouldLogLevel(level)) {
      this.queueForRemote(logEntry);
    }

    // Flush if queue is full
    if (this.logQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Check if the log level should be logged
   */
  private shouldLogLevel(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex <= currentLevelIndex;
  }

  /**
   * Log to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry;
    const timeStr = new Date(timestamp).toLocaleTimeString();

    const styles = {
      [LogLevel.ERROR]: 'color: red; font-weight: bold;',
      [LogLevel.WARN]: 'color: orange; font-weight: bold;',
      [LogLevel.INFO]: 'color: blue;',
      [LogLevel.DEBUG]: 'color: gray;',
    };

    const levelEmoji = {
      [LogLevel.ERROR]: '🚨',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.DEBUG]: '🐛',
    };

    console.group(`${levelEmoji[level]} [${timeStr}] ${level.toUpperCase()}: ${message}`);
    
    if (context && Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
    
    if (entry.stack) {
      console.log('Stack:', entry.stack);
    }
    
    console.log('Session ID:', entry.sessionId);
    console.log('URL:', entry.url);
    
    console.groupEnd();
  }

  /**
   * Queue log entry for remote logging
   */
  private queueForRemote(entry: LogEntry): void {
    // In a real implementation, this would send to a remote logging service
    // For now, we'll just store it for potential future use
    if (this.config.remoteEndpoint) {
      // Implementation would go here
    }
  }

  /**
   * Flush logs to remote service
   */
  private async flush(): Promise<void> {
    if (this.logQueue.length === 0 || !this.config.enableRemote) {
      return;
    }

    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToFlush,
            sessionId: this.sessionId,
            userId: this.userId,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to flush logs to remote service:', error);
      // Re-queue logs for retry
      this.logQueue.unshift(...logsToFlush);
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (!this.config.enablePerformance) return;

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.logPerformance('page_load', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
        });
      }
    });

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.logPerformance('resource_load', {
            name: entry.name,
            duration: entry.duration,
            size: (entry as any).transferSize || 0,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Get first paint time
   */
  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : undefined;
  }

  /**
   * Get first contentful paint time
   */
  private getFirstContentfulPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : undefined;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (!this.config.enableErrorTracking) return;

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, metrics: Record<string, any>): void {
    this.log(LogLevel.INFO, `Performance: ${operation}`, {
      type: 'performance',
      operation,
      ...metrics,
    });
  }

  /**
   * Log user actions
   */
  logAction(action: string, context: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, `User Action: ${action}`, {
      type: 'user_action',
      action,
      ...context,
    });
  }

  /**
   * Log component lifecycle events
   */
  logComponent(component: string, event: string, context: Record<string, any> = {}): void {
    this.log(LogLevel.DEBUG, `Component ${event}: ${component}`, {
      type: 'component',
      component,
      event,
      ...context,
    });
  }

  /**
   * Log API calls
   */
  logApiCall(method: string, url: string, status: number, duration: number, context: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, `API Call: ${method} ${url}`, {
      type: 'api_call',
      method,
      url,
      status,
      duration,
      ...context,
    });
  }

  /**
   * Public logging methods
   */
  error(message: string, context: Record<string, any> = {}): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context: Record<string, any> = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context: Record<string, any> = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Create singleton instance
const logger = new FrontendLogger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  enablePerformance: true,
  enableErrorTracking: true,
});

// Export logger instance and types
export default logger;
export { LogLevel, LogEntry, LoggerConfig };
export type { LogEntry, LoggerConfig };