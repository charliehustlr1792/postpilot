import { UserButton } from '@clerk/nextjs';
import React from 'react';

const DashboardHomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            <p className="text-gray-600">Manage your social media posts</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">View your performance metrics</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Schedule</h2>
            <p className="text-gray-600">Plan your content calendar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;