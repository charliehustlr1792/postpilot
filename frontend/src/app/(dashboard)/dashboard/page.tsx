'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { FileText, Eye, Heart, Clock, TrendingUp } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CalendarPreview from '@/components/dashboard/CalendarPreview';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ConnectAccountsCard from '@/components/dashboard/ConnectAccountsCard';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Platform } from '@/types/post';

interface DashboardStats {
  totalPosts: number;
  totalReach: number;
  engagementRate: number;
  scheduledPosts: number;
}

const DashboardPage = () => {
  const { getToken, isLoaded } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [connectedAccountCount, setConnectedAccountCount] = useState(0);
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('You need to be signed in to load dashboard stats');
      }
      const data = await api.getDashboardOverview(token);
      if (!data?.stats) {
        throw new Error('Dashboard stats were empty');
      }
      setStats(data.stats);
      setConnectedAccountCount(data.connectedAccountCount ?? 0);
      setAvailablePlatforms(data.availablePlatforms ?? ['TWITTER', 'LINKEDIN']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const needsConnect = !isLoading && !error && connectedAccountCount === 0;

  return (
    <div className="space-y-6">
      {error ? (
        <ErrorState title="Couldn't load dashboard stats" message={error} onRetry={loadStats} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Total Posts" value={stats?.totalPosts ?? 0} icon={FileText} />
              <StatCard title="Total Reach" value={formatNumber(stats?.totalReach ?? 0)} icon={Eye} />
              <StatCard
                title="Engagement Rate"
                value={`${(stats?.engagementRate ?? 0).toFixed(1)}%`}
                icon={Heart}
              />
              <StatCard
                title="Scheduled Posts"
                value={stats?.scheduledPosts ?? 0}
                icon={Clock}
                subtitle="Upcoming scheduled posts"
              />
            </>
          )}
        </div>
      )}

      {needsConnect && <ConnectAccountsCard availablePlatforms={availablePlatforms} />}

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart />
          <RecentActivity />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <CalendarPreview />

          <div className="bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] rounded-xl p-6 text-white relative overflow-hidden">
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
