/**
 * React Hooks for Logging
 * 
 * Custom hooks that provide logging functionality for React components
 * with automatic lifecycle tracking and performance monitoring.
 */

import { useEffect, useRef, useCallback } from 'react';
import logger from '../utils/logger';
import { LogLevel } from '../utils/logger';

/**
 * Hook for component lifecycle logging
 */
export const useComponentLogger = (componentName: string, props?: Record<string, any>) => {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    // Component mounted
    logger.logComponent(componentName, 'mounted', {
      props: props ? Object.keys(props) : [],
      mountTime: mountTime.current,
    });

    return () => {
      // Component unmounted
      const lifetime = Date.now() - mountTime.current;
      logger.logComponent(componentName, 'unmounted', {
        lifetime,
        renderCount: renderCount.current,
      });
    };
  }, [componentName, props]);

  useEffect(() => {
    // Component rendered
    renderCount.current += 1;
    logger.logComponent(componentName, 'rendered', {
      renderCount: renderCount.current,
    });
  });

  return {
    logComponentEvent: useCallback((event: string, context?: Record<string, any>) => {
      logger.logComponent(componentName, event, context);
    }, [componentName]),
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceLogger = (operationName: string) => {
  const startTime = useRef<number>(Date.now());

  const startTimer = useCallback(() => {
    startTime.current = Date.now();
  }, []);

  const endTimer = useCallback((context?: Record<string, any>) => {
    const duration = Date.now() - startTime.current;
    logger.logPerformance(operationName, {
      duration,
      ...context,
    });
    return duration;
  }, [operationName]);

  const measureAsync = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> => {
    startTimer();
    try {
      const result = await asyncOperation();
      endTimer({ ...context, success: true });
      return result;
    } catch (error) {
      endTimer({ ...context, success: false, error: (error as Error).message });
      throw error;
    }
  }, [startTimer, endTimer]);

  return {
    startTimer,
    endTimer,
    measureAsync,
  };
};

/**
 * Hook for user interaction logging
 */
export const useInteractionLogger = (componentName: string) => {
  const logClick = useCallback((element: string, context?: Record<string, any>) => {
    logger.logAction('click', {
      component: componentName,
      element,
      ...context,
    });
  }, [componentName]);

  const logHover = useCallback((element: string, context?: Record<string, any>) => {
    logger.logAction('hover', {
      component: componentName,
      element,
      ...context,
    });
  }, [componentName]);

  const logFocus = useCallback((element: string, context?: Record<string, any>) => {
    logger.logAction('focus', {
      component: componentName,
      element,
      ...context,
    });
  }, [componentName]);

  const logInput = useCallback((element: string, value: string, context?: Record<string, any>) => {
    logger.logAction('input', {
      component: componentName,
      element,
      valueLength: value.length,
      ...context,
    });
  }, [componentName]);

  return {
    logClick,
    logHover,
    logFocus,
    logInput,
  };
};

/**
 * Hook for error boundary logging
 */
export const useErrorLogger = (componentName: string) => {
  const logError = useCallback((error: Error, context?: Record<string, any>) => {
    logger.error(`Error in ${componentName}`, {
      component: componentName,
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }, [componentName]);

  const logWarning = useCallback((warning: string, context?: Record<string, any>) => {
    logger.warn(`Warning in ${componentName}: ${warning}`, {
      component: componentName,
      ...context,
    });
  }, [componentName]);

  return {
    logError,
    logWarning,
  };
};

/**
 * Hook for API call logging
 */
export const useApiLogger = () => {
  const logApiCall = useCallback((
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ) => {
    logger.logApiCall(method, url, status, duration, context);
  }, []);

  const logApiError = useCallback((
    method: string,
    url: string,
    error: Error,
    duration: number,
    context?: Record<string, any>
  ) => {
    logger.error(`API Error: ${method} ${url}`, {
      method,
      url,
      error: error.message,
      stack: error.stack,
      duration,
      ...context,
    });
  }, []);

  return {
    logApiCall,
    logApiError,
  };
};

/**
 * Hook for form logging
 */
export const useFormLogger = (formName: string) => {
  const logFormSubmit = useCallback((data: Record<string, any>, context?: Record<string, any>) => {
    logger.logAction('form_submit', {
      form: formName,
      fieldCount: Object.keys(data).length,
      ...context,
    });
  }, [formName]);

  const logFormError = useCallback((field: string, error: string, context?: Record<string, any>) => {
    logger.warn(`Form Error: ${formName}`, {
      form: formName,
      field,
      error,
      ...context,
    });
  }, [formName]);

  const logFormFieldChange = useCallback((field: string, value: any, context?: Record<string, any>) => {
    logger.logAction('form_field_change', {
      form: formName,
      field,
      valueType: typeof value,
      ...context,
    });
  }, [formName]);

  return {
    logFormSubmit,
    logFormError,
    logFormFieldChange,
  };
};

/**
 * Hook for navigation logging
 */
export const useNavigationLogger = () => {
  const logNavigation = useCallback((from: string, to: string, context?: Record<string, any>) => {
    logger.logAction('navigation', {
      from,
      to,
      ...context,
    });
  }, []);

  const logRouteChange = useCallback((route: string, context?: Record<string, any>) => {
    logger.logAction('route_change', {
      route,
      ...context,
    });
  }, []);

  return {
    logNavigation,
    logRouteChange,
  };
};

/**
 * Hook for custom logging with component context
 */
export const useCustomLogger = (componentName: string) => {
  const log = useCallback((level: LogLevel, message: string, context?: Record<string, any>) => {
    logger[level](`[${componentName}] ${message}`, {
      component: componentName,
      ...context,
    });
  }, [componentName]);

  return {
    log,
    error: useCallback((message: string, context?: Record<string, any>) => {
      log(LogLevel.ERROR, message, context);
    }, [log]),
    warn: useCallback((message: string, context?: Record<string, any>) => {
      log(LogLevel.WARN, message, context);
    }, [log]),
    info: useCallback((message: string, context?: Record<string, any>) => {
      log(LogLevel.INFO, message, context);
    }, [log]),
    debug: useCallback((message: string, context?: Record<string, any>) => {
      log(LogLevel.DEBUG, message, context);
    }, [log]),
  };
};