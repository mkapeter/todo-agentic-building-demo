/**
 * Dashboard page - main todo interface
 */

import React from 'react';
import { Header } from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your tasks with our modern block-style editing interface.
          </p>
        </div>

        {/* Todo interface will be implemented here */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Todo Interface Coming Soon
            </h2>
            <p className="text-gray-600 mb-4">
              The todo management interface will be implemented next.
            </p>
            <div className="text-sm text-gray-500">
              Authentication is now fully functional! ✅
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};