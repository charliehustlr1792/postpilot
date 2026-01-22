'use client';

import React, { useState } from 'react';
import { Eye, Heart, Share2, TrendingUp, TrendingDown, Download, ArrowUpRight } from 'lucide-react';
import {  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PLATFORM_COLORS} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'engagement' | 'clicks'>('impressions');

  // Mock data - replace with real API data
  const overviewStats = {
    totalImpressions: 125400,
    totalEngagement: 8234,
    totalClicks: 4567,
    totalShares: 1823,
    impressionsChange: 22.5,
    engagementChange: 15.3,
    clicksChange: -3.2,
    sharesChange: 8.7,
  };

  const engagementData = [
    { date: 'Jan 1', impressions: 12000, engagement: 1200, clicks: 450 },
    { date: 'Jan 5', impressions: 15000, engagement: 1600, clicks: 520 },
    { date: 'Jan 10', impressions: 18000, engagement: 1900, clicks: 680 },
    { date: 'Jan 15', impressions: 22000, engagement: 2400, clicks: 890 },
    { date: 'Jan 20', impressions: 25000, engagement: 2800, clicks: 1020 },
    { date: 'Jan 25', impressions: 28000, engagement: 3100, clicks: 1150 },
    { date: 'Jan 30', impressions: 32000, engagement: 3500, clicks: 1340 },
  ];

  const platformData = [
    { platform: 'Twitter', value: 35, posts: 45, engagement: 2890 },
    { platform: 'Instagram', value: 28, posts: 32, engagement: 2340 },
    { platform: 'LinkedIn', value: 22, posts: 28, engagement: 1850 },
    { platform: 'Facebook', value: 15, posts: 22, engagement: 1260 },
  ];

  const topPosts = [
    {
      id: '1',
      content: 'Just launched our new AI-powered analytics dashboard! 🚀',
      platform: 'twitter',
      impressions: 15420,
      likes: 892,
      shares: 234,
      comments: 156,
      engagementRate: 8.4,
    },
    {
      id: '2',
      content: 'Behind the scenes of our product development process 📱',
      platform: 'instagram',
      impressions: 12680,
      likes: 1240,
      shares: 189,
      comments: 203,
      engagementRate: 12.9,
    },
    {
      id: '3',
      content: 'Excited to share our company growth story! 💼',
      platform: 'linkedin',
      impressions: 9850,
      likes: 567,
      shares: 145,
      comments: 89,
      engagementRate: 8.1,
    },
    {
      id: '4',
      content: 'Weekend vibes! What are you working on? 🌟',
      platform: 'facebook',
      impressions: 8920,
      likes: 423,
      shares: 98,
      comments: 67,
      engagementRate: 6.6,
    },
  ];

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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/10 to-[#FF6E00]/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#FF6E00]" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              overviewStats.impressionsChange > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {overviewStats.impressionsChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(overviewStats.impressionsChange)}%
            </div>
          </div>
          <p className="text-[#4D4946] text-sm font-medium mb-1">Total Impressions</p>
          <p className="text-[#181817] text-3xl font-bold">{formatNumber(overviewStats.totalImpressions)}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/10 to-[#FF6E00]/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#FF6E00]" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              overviewStats.engagementChange > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {overviewStats.engagementChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(overviewStats.engagementChange)}%
            </div>
          </div>
          <p className="text-[#4D4946] text-sm font-medium mb-1">Total Engagement</p>
          <p className="text-[#181817] text-3xl font-bold">{formatNumber(overviewStats.totalEngagement)}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/10 to-[#FF6E00]/10 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-[#FF6E00]" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              overviewStats.clicksChange > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {overviewStats.clicksChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(overviewStats.clicksChange)}%
            </div>
          </div>
          <p className="text-[#4D4946] text-sm font-medium mb-1">Total Clicks</p>
          <p className="text-[#181817] text-3xl font-bold">{formatNumber(overviewStats.totalClicks)}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/10 to-[#FF6E00]/10 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-[#FF6E00]" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              overviewStats.sharesChange > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {overviewStats.sharesChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(overviewStats.sharesChange)}%
            </div>
          </div>
          <p className="text-[#4D4946] text-sm font-medium mb-1">Total Shares</p>
          <p className="text-[#181817] text-3xl font-bold">{formatNumber(overviewStats.totalShares)}</p>
        </div>
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
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
          <h2 className="text-lg font-bold text-[#181817] mb-2">Platform Distribution</h2>
          <p className="text-[#4D4946] text-sm mb-6">Engagement by platform</p>

          <div className="h-[200px] mb-6">
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
              {topPosts.map((post) => (
                <tr key={post.id} className="border-b border-[#EAE7E4] hover:bg-[#F3EFEC] transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-[#181817] text-sm font-medium line-clamp-1">{post.content}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium"
                      style={{ backgroundColor: PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS] }}
                    >
                      {/* {PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS]} */}
                      <span className="capitalize">{post.platform}</span>
                    </span>
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
                      {post.engagementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;