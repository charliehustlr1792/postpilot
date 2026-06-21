'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { FileText, Eye, Heart, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CalendarPreview from '@/components/dashboard/CalendarPreview';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface DashboardStats {
  totalPosts: number;
  totalReach: number;
  engagementRate: number;
  scheduledPosts: number;
}

const DashboardPage = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const [userStats, overview, scheduled] = await Promise.all([
        api.getMyStats(token),
        api.getAnalyticsOverview({}, token),
        api.getScheduledPosts(token),
      ]);
      setStats({
        totalPosts: userStats.stats.totalPosts,
        totalReach: overview.overview.totalReach,
        engagementRate: overview.overview.avgEngagementRate,
        scheduledPosts: scheduled.posts.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const dash = (v: string | number) => (isLoading ? '—' : v);

  return (
    <div className="space-y-6">
      {/* Stats error */}
      {error && (
        <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button onClick={() => loadStats()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={dash(stats?.totalPosts ?? 0)}
          icon={FileText}
        />
        <StatCard
          title="Total Reach"
          value={dash(formatNumber(stats?.totalReach ?? 0))}
          icon={Eye}
        />
        <StatCard
          title="Engagement Rate"
          value={dash(`${(stats?.engagementRate ?? 0).toFixed(1)}%`)}
          icon={Heart}
        />
        <StatCard
          title="Scheduled Posts"
          value={dash(stats?.scheduledPosts ?? 0)}
          icon={Clock}
          subtitle="Upcoming scheduled posts"
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