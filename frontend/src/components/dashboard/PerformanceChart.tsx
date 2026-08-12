'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

type TimeRange = '7d' | '30d' | '90d';

const DAYS_FOR: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const PerformanceChart = () => {
  const { getToken, isLoaded } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartData, setChartData] = useState<{ date: string; views: number; engagement: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('You need to be signed in');
      const { trends } = await api.getAnalyticsTrends({ days: DAYS_FOR[timeRange] }, token);
      setChartData(
        trends.map((t) => ({
          date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          views: t.impressions,
          engagement: t.likes + t.shares + t.comments,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance');
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded, timeRange]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(
    () => ({
      views: chartData.reduce((sum, item) => sum + item.views, 0),
      engagement: chartData.reduce((sum, item) => sum + item.engagement, 0),
    }),
    [chartData],
  );

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { value?: number; payload?: { date?: string } }[];
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#EAE7E4] rounded-lg p-3 shadow-lg">
          <p className="text-[#181817] font-semibold text-sm mb-2">{payload[0].payload?.date}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6E00]" />
              <span className="text-[#4D4946] text-xs">Views:</span>
              <span className="text-[#181817] font-semibold text-xs">
                {(payload[0].value ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF9B4F]" />
              <span className="text-[#4D4946] text-xs">Engagement:</span>
              <span className="text-[#181817] font-semibold text-xs">
                {(payload[1].value ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[#181817] text-lg font-bold mb-1">Performance Overview</h2>
          <p className="text-[#4D4946]/70 text-sm">Track your growth over time</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#F3EFEC] rounded-lg">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-white text-[#FF6E00] shadow-sm'
                  : 'text-[#4D4946] hover:text-[#FF6E00]'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState title="Couldn't load performance" message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-[#F3EFEC]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#FF6E00]" />
                <span className="text-[#4D4946] text-xs font-medium">Total Views</span>
              </div>
              <p className="text-[#181817] text-2xl font-bold">
                {isLoading ? '—' : formatNumber(totals.views)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F3EFEC]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#FF9B4F]" />
                <span className="text-[#4D4946] text-xs font-medium">Engagement</span>
              </div>
              <p className="text-[#181817] text-2xl font-bold">
                {isLoading ? '—' : formatNumber(totals.engagement)}
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-12 h-12 text-[#4D4946]/30 mb-3" />
                <p className="text-[#4D4946] text-sm">No performance data yet</p>
                <p className="text-[#4D4946]/60 text-xs mt-1">
                  Metrics appear here after you publish posts
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6E00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6E00" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9B4F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF9B4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E4" />
                  <XAxis
                    dataKey="date"
                    stroke="#4D4946"
                    tick={{ fill: '#4D4946', fontSize: 12 }}
                    tickLine={{ stroke: '#EAE7E4' }}
                  />
                  <YAxis
                    stroke="#4D4946"
                    tick={{ fill: '#4D4946', fontSize: 12 }}
                    tickLine={{ stroke: '#EAE7E4' }}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#FF6E00"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#FF9B4F"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEngagement)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceChart;
