/**
 * Main App Component
 * 
 * This is the root component of the Todo App frontend
 * with integrated centralized logging.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logger from './utils/logger';
import LoggingExample from './components/LoggingExample';

const App: React.FC = () => {
  // Initialize logging for the app
  useEffect(() => {
    logger.info('Todo App initialized', {
      version: '1.0.0',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    });

    // Log page load performance
    const handleLoad = () => {
      logger.logPerformance('app_load', {
        loadTime: performance.now(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Todo App
              </h1>
              <div className="text-sm text-gray-500">
                Centralized Logging Demo
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<LoggingExample />} />
            <Route path="/logging-demo" element={<LoggingExample />} />
          </Routes>
        </main>

        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              <p>Todo App with Centralized Logging System</p>
              <p>Check browser console for log messages</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;