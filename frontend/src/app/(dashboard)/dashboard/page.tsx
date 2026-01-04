// app/(dashboard)/dashboard/page.tsx
'use client';

import React from 'react';
import { FileText, Eye, Heart, Clock, Plus, TrendingUp } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CalendarPreview from '@/components/dashboard/CalendarPreview';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const DashboardPage = () => {
  // Mock data - replace with real data from your API
  const stats = {
    totalPosts: 127,
    totalReach: '45.2K',
    engagementRate: '8.4%',
    scheduledPosts: 12,
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          change={{ value: '+12%', trend: 'up' }}
        />
        <StatCard
          title="Total Reach"
          value={stats.totalReach}
          icon={Eye}
          change={{ value: '+18%', trend: 'up' }}
        />
        <StatCard
          title="Engagement Rate"
          value={stats.engagementRate}
          icon={Heart}
          change={{ value: '+5%', trend: 'up' }}
        />
        <StatCard
          title="Scheduled Posts"
          value={stats.scheduledPosts}
          icon={Clock}
          subtitle="Next: Today at 2:30 PM"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <PerformanceChart />

          {/* Recent Activity */}
          <RecentActivity />
        </div>

        {/* Right Column - Takes 1/3 on large screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calendar Preview */}
          <CalendarPreview />

          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] rounded-xl p-6 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-white/90 text-sm mb-4">
                Unlock unlimited posts, AI-powered suggestions, and advanced analytics
              </p>
              <button className="w-full bg-white text-[#FF6E00] font-semibold px-4 py-2.5 rounded-lg hover:bg-white/90 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;