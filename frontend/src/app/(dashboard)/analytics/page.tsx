'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Eye, Heart, Share2, TrendingUp, Download, ArrowUpRight } from 'lucide-react';
import {  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { api, AnalyticsOverviewResponse, AnalyticsTrendsResponse, PlatformBreakdownItem } from '@/lib/api';
import { Post, postPlatforms } from '@/types/post';
import { Skeleton, StatCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { PlatformIcon } from '@/components/ui/PlatformIcon';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const DAYS_FOR: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: 36500,
};

// Aggregate a post's latest analytics across all of its targets.
function aggregatePost(post: Post) {
  return post.targets.reduce(
    (acc, t) => {
      const a = t.analytics?.[0];
      if (a) {
        acc.impressions += a.impressions;
        acc.likes += a.likes;
        acc.comments += a.comments;
        acc.shares += a.shares;
      }
      return acc;
    },
    { impressions: 0, likes: 0, comments: 0, shares: 0 },
  );
}

const AnalyticsPage = () => {
  const { getToken } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'engagement' | 'clicks'>('impressions');

  const [overview, setOverview] = useState<AnalyticsOverviewResponse['overview'] | null>(null);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdownItem[]>([]);
  const [trends, setTrends] = useState<AnalyticsTrendsResponse['trends']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const days = DAYS_FOR[timeRange];
      const [overviewRes, trendsRes] = await Promise.all([
        api.getAnalyticsOverview({ days }, token),
        api.getAnalyticsTrends({ days }, token),
      ]);
      setOverview(overviewRes.overview);
      setTopPosts(overviewRes.topPosts);
      setPlatformBreakdown(overviewRes.platformBreakdown);
      setTrends(trendsRes.trends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, timeRange]);

  useEffect(() => {
    load();
  }, [load]);

  const totalEngagement =
    (overview?.totalLikes ?? 0) + (overview?.totalShares ?? 0) + (overview?.totalComments ?? 0);

  // Chart series derived from the per-day trend rows.
  const engagementData = useMemo(
    () =>
      trends.map((t) => ({
        date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        impressions: t.impressions,
        engagement: t.likes + t.shares + t.comments,
        clicks: t.clicks,
      })),
    [trends],
  );

  // Per-platform engagement distribution, served by the overview endpoint.
  const platformData = useMemo(() => {
    const total = platformBreakdown.reduce((s, p) => s + p.engagement, 0);
    return platformBreakdown.map((p) => ({
      platform: PLATFORM_LABELS[p.platform],
      value: total > 0 ? Math.round((p.engagement / total) * 100) : 0,
      posts: p.posts,
      engagement: p.engagement,
    }));
  }, [platformBreakdown]);

  // Top posts flattened into table rows with aggregated metrics.
  const topPostRows = useMemo(
    () =>
      topPosts.map((post) => {
        const m = aggregatePost(post);
        const engagement = m.likes + m.shares + m.comments;
        const engagementRate = m.impressions > 0 ? (engagement / m.impressions) * 100 : 0;
        const platforms = postPlatforms(post);
        return {
          id: post.id,
          content: post.content,
          platforms,
          impressions: m.impressions,
          likes: m.likes,
          comments: m.comments,
          shares: m.shares,
          engagementRate,
        };
      }),
    [topPosts],
  );

  const COLORS = ['#FF6E00', '#FF9B4F', '#FFB67D', '#FFD4B2'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#EAE7E4] rounded-lg p-3 shadow-lg">
          <p className="text-[#181817] font-semibold text-sm mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#4D4946] text-xs capitalize">{item.name}:</span>
              </div>
              <span className="text-[#181817] font-semibold text-xs">
                {formatNumber(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181817]">Analytics Dashboard</h1>
          <p className="text-[#4D4946] text-sm mt-1">
            Track your performance and optimize your strategy
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#F3EFEC] rounded-lg">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white text-[#FF6E00] shadow-sm'
                    : 'text-[#4D4946] hover:text-[#FF6E00]'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EAE7E4] text-[#4D4946] font-medium rounded-lg hover:border-[#FF9B4F] transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState title="Couldn't load analytics" message={error} onRetry={load} />
      ) : (
       <>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : [
              { label: 'Total Impressions', icon: Eye, value: overview?.totalImpressions ?? 0 },
              { label: 'Total Engagement', icon: Heart, value: totalEngagement },
              { label: 'Total Clicks', icon: ArrowUpRight, value: overview?.totalClicks ?? 0 },
              { label: 'Total Shares', icon: Share2, value: overview?.totalShares ?? 0 },
            ].map(({ label, icon: Icon, value }) => (
              <div key={label} className="bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/10 to-[#FF6E00]/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#FF6E00]" />
                  </div>
                </div>
                <p className="text-[#4D4946] text-sm font-medium mb-1">{label}</p>
                <p className="text-[#181817] text-3xl font-bold">{formatNumber(value)}</p>
              </div>
            ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Over Time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#EAE7E4] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#181817]">Performance Over Time</h2>
              <p className="text-[#4D4946] text-sm mt-1">Track your growth metrics</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#F3EFEC] rounded-lg">
              {(['impressions', 'engagement', 'clicks'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedMetric === metric
                      ? 'bg-white text-[#FF6E00] shadow-sm'
                      : 'text-[#4D4946] hover:text-[#FF6E00]'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6E00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6E00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E4" />
                <XAxis dataKey="date" stroke="#4D4946" tick={{ fill: '#4D4946', fontSize: 12 }} />
                <YAxis stroke="#4D4946" tick={{ fill: '#4D4946', fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#FF6E00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
          <h2 className="text-lg font-bold text-[#181817] mb-2">Platform Distribution</h2>
          <p className="text-[#4D4946] text-sm mb-6">Engagement by platform</p>

          <div className="h-[200px] mb-6 flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-40 h-40 rounded-full" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-3">
            {platformData.map((platform, index) => (
              <div key={platform.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-[#181817] text-sm font-medium">{platform.platform}</span>
                </div>
                <div className="text-right">
                  <p className="text-[#181817] text-sm font-bold">{platform.value}%</p>
                  <p className="text-[#4D4946]/60 text-xs">{platform.posts} posts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#181817]">Top Performing Posts</h2>
            <p className="text-[#4D4946] text-sm mt-1">Your best content this period</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAE7E4]">
                <th className="text-left py-3 px-4 text-[#4D4946] font-semibold text-sm">Post</th>
                <th className="text-left py-3 px-4 text-[#4D4946] font-semibold text-sm">Platform</th>
                <th className="text-right py-3 px-4 text-[#4D4946] font-semibold text-sm">Impressions</th>
                <th className="text-right py-3 px-4 text-[#4D4946] font-semibold text-sm">Likes</th>
                <th className="text-right py-3 px-4 text-[#4D4946] font-semibold text-sm">Comments</th>
                <th className="text-right py-3 px-4 text-[#4D4946] font-semibold text-sm">Shares</th>
                <th className="text-right py-3 px-4 text-[#4D4946] font-semibold text-sm">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : topPostRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#4D4946]/60 text-sm">
                    No published posts with analytics in this period yet.
                  </td>
                </tr>
              ) : (
                topPostRows.map((post) => (
                  <tr key={post.id} className="border-b border-[#EAE7E4] hover:bg-[#F3EFEC] transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-[#181817] text-sm font-medium line-clamp-1">{post.content}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium"
                            style={{ backgroundColor: PLATFORM_COLORS[p] }}
                          >
                            <PlatformIcon platform={p} className="w-3 h-3" />
                            {PLATFORM_LABELS[p]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-[#181817] text-sm font-medium">
                      {formatNumber(post.impressions)}
                    </td>
                    <td className="py-4 px-4 text-right text-[#181817] text-sm font-medium">
                      {formatNumber(post.likes)}
                    </td>
                    <td className="py-4 px-4 text-right text-[#181817] text-sm font-medium">
                      {formatNumber(post.comments)}
                    </td>
                    <td className="py-4 px-4 text-right text-[#181817] text-sm font-medium">
                      {formatNumber(post.shares)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {post.engagementRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default AnalyticsPage;