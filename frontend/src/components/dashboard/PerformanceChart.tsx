'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

const PerformanceChart = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - replace with real data from your API
  const data = {
    '7d': [
      { date: 'Mon', views: 2400, engagement: 400 },
      { date: 'Tue', views: 1398, engagement: 210 },
      { date: 'Wed', views: 9800, engagement: 890 },
      { date: 'Thu', views: 3908, engagement: 480 },
      { date: 'Fri', views: 4800, engagement: 520 },
      { date: 'Sat', views: 3800, engagement: 430 },
      { date: 'Sun', views: 4300, engagement: 510 },
    ],
    '30d': [
      { date: 'Week 1', views: 12000, engagement: 1200 },
      { date: 'Week 2', views: 15000, engagement: 1600 },
      { date: 'Week 3', views: 18000, engagement: 1900 },
      { date: 'Week 4', views: 22000, engagement: 2400 },
    ],
    '90d': [
      { date: 'Month 1', views: 45000, engagement: 4500 },
      { date: 'Month 2', views: 52000, engagement: 5400 },
      { date: 'Month 3', views: 68000, engagement: 7200 },
    ],
  };

  const chartData = data[timeRange];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#EAE7E4] rounded-lg p-3 shadow-lg">
          <p className="text-[#181817] font-semibold text-sm mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6E00]" />
              <span className="text-[#4D4946] text-xs">Views:</span>
              <span className="text-[#181817] font-semibold text-xs">
                {payload[0].value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF9B4F]" />
              <span className="text-[#4D4946] text-xs">Engagement:</span>
              <span className="text-[#181817] font-semibold text-xs">
                {payload[1].value.toLocaleString()}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[#181817] text-lg font-bold mb-1">Performance Overview</h2>
          <p className="text-[#4D4946]/70 text-sm">Track your growth over time</p>
        </div>

        {/* Time Range Selector */}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-[#F3EFEC]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#FF6E00]" />
            <span className="text-[#4D4946] text-xs font-medium">Total Views</span>
          </div>
          <p className="text-[#181817] text-2xl font-bold">
            {chartData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-600 text-xs font-medium">+12.5%</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#F3EFEC]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#FF9B4F]" />
            <span className="text-[#4D4946] text-xs font-medium">Engagement</span>
          </div>
          <p className="text-[#181817] text-2xl font-bold">
            {chartData.reduce((sum, item) => sum + item.engagement, 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-600 text-xs font-medium">+8.3%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
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
              tickFormatter={(value) => `${value / 1000}K`}
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
      </div>
    </div>
  );
};

export default PerformanceChart;