/**
 * Logging Example Component
 * 
 * This component demonstrates the usage of the centralized logging system
 * in a React component with various logging scenarios.
 */

import React, { useState, useEffect } from 'react';
import {
  useComponentLogger,
  usePerformanceLogger,
  useInteractionLogger,
  useErrorLogger,
  useFormLogger,
  useCustomLogger,
} from '../hooks/useLogger';
import logger from '../utils/logger';

const LoggingExample: React.FC = () => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize logging hooks
  const { logComponentEvent } = useComponentLogger('LoggingExample', { count, inputValue });
  const { startTimer, endTimer, measureAsync } = usePerformanceLogger('LoggingExample');
  const { logClick, logHover, logInput } = useInteractionLogger('LoggingExample');
  const { logError, logWarning } = useErrorLogger('LoggingExample');
  const { logFormSubmit, logFormError, logFormFieldChange } = useFormLogger('LoggingExample');
  const { error, warn, info, debug } = useCustomLogger('LoggingExample');

  // Component mount logging
  useEffect(() => {
    info('Component mounted successfully');
    logComponentEvent('initialized');
  }, [info, logComponentEvent]);

  // Handle button click with logging
  const handleIncrement = () => {
    startTimer();
    logClick('increment-button', { currentCount: count });
    
    try {
      setCount(prev => prev + 1);
      info('Count incremented', { newCount: count + 1 });
      endTimer({ action: 'increment', newCount: count + 1 });
    } catch (err) {
      logError(err as Error, { action: 'increment', count });
      endTimer({ action: 'increment', error: true });
    }
  };

  // Handle input change with logging
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    logInput('text-input', value, { valueLength: value.length });
    logFormFieldChange('inputValue', value);
  };

  // Handle form submission with logging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      logFormError('inputValue', 'Input cannot be empty');
      logWarning('Form submission attempted with empty input');
      return;
    }

    setIsLoading(true);
    logFormSubmit({ inputValue, count });

    try {
      // Simulate async operation
      await measureAsync(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (Math.random() < 0.1) {
          throw new Error('Simulated error');
        }
      }, { inputValue, count });

      info('Form submitted successfully', { inputValue, count });
      setInputValue('');
    } catch (err) {
      logError(err as Error, { inputValue, count });
      logFormError('submit', (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle hover events
  const handleMouseEnter = () => {
    logHover('example-container');
  };

  // Demonstrate different log levels
  const demonstrateLogLevels = () => {
    debug('This is a debug message', { timestamp: Date.now() });
    info('This is an info message', { userAction: 'demonstrate_logs' });
    warn('This is a warning message', { warningType: 'demonstration' });
    error('This is an error message', { errorType: 'demonstration' });
  };

  // Demonstrate performance logging
  const demonstratePerformance = () => {
    startTimer();
    setTimeout(() => {
      endTimer({ operation: 'demonstration' });
    }, 500);
  };

  // Demonstrate error logging
  const demonstrateError = () => {
    try {
      throw new Error('This is a demonstration error');
    } catch (err) {
      logError(err as Error, { context: 'demonstration' });
    }
  };

  return (
    <div 
      className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg"
      onMouseEnter={handleMouseEnter}
    >
      <h2 className="text-2xl font-bold mb-4">Centralized Logging Demo</h2>
      
      <div className="space-y-4">
        {/* Counter Section */}
        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Counter: {count}</h3>
          <button
            onClick={handleIncrement}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Form Example</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter some text..."
              className="w-full px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Logging Demonstration Section */}
        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Logging Demonstrations</h3>
          <div className="space-x-2">
            <button
              onClick={demonstrateLogLevels}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Log Levels
            </button>
            <button
              onClick={demonstratePerformance}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Performance
            </button>
            <button
              onClick={demonstrateError}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Error Demo
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="text-sm space-y-1">
            <li>• Open browser console to see log messages</li>
            <li>• Click buttons to trigger different logging scenarios</li>
            <li>• Try submitting empty form to see error logging</li>
            <li>• Hover over the container to see interaction logging</li>
            <li>• Check network tab for any remote logging requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoggingExample;