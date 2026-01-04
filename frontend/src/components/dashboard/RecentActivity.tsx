'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle, Eye, ArrowRight } from 'lucide-react';
import { PLATFORM_COLORS } from '@/lib/constants';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'published' | 'scheduled' | 'failed';
  platform: string;
  content: string;
  timestamp: Date;
  metrics?: {
    views: number;
    engagement: number;
  };
}

const RecentActivity = () => {
  // Mock data - replace with real data from your API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'published',
      platform: 'twitter',
      content: 'Just launched our new AI-powered analytics dashboard! 🚀 #tech #analytics',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      metrics: { views: 2450, engagement: 89 },
    },
    {
      id: '2',
      type: 'published',
      platform: 'instagram',
      content: 'Behind the scenes of our product development process. Swipe to see more! 📱',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      metrics: { views: 3200, engagement: 156 },
    },
    {
      id: '3',
      type: 'scheduled',
      platform: 'linkedin',
      content: 'Excited to share our company\'s growth story and what\'s next for our team! 💼',
      timestamp: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
    },
    {
      id: '4',
      type: 'published',
      platform: 'facebook',
      content: 'Weekend vibes! What\'s everyone working on? Drop your projects below ⬇️',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      metrics: { views: 5600, engagement: 234 },
    },
  ];

  const getStatusIcon = (type: Activity['type']) => {
    switch (type) {
      case 'published':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (type: Activity['type']) => {
    switch (type) {
      case 'published':
        return 'Published';
      case 'scheduled':
        return 'Scheduled';
      case 'failed':
        return 'Failed';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const absDiff = Math.abs(diff);
    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    if (diff > 0) {
      // Future
      if (minutes < 60) return `in ${minutes}m`;
      if (hours < 24) return `in ${hours}h`;
      return `in ${days}d`;
    } else {
      // Past
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#181817] text-lg font-bold">Recent Activity</h2>
        <Link
          href="/dashboard/posts"
          className="text-[#FF6E00] text-sm font-medium hover:text-[#FF9B4F] transition-colors flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group p-4 rounded-xl border border-[#EAE7E4] hover:border-[#FF9B4F] hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {/* Platform Badge */}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ 
                      backgroundColor: PLATFORM_COLORS[activity.platform as keyof typeof PLATFORM_COLORS] 
                    }}
                  >
                  {/* {PLATFORM_ICONS[activity.platform as keyof typeof PLATFORM_ICONS]}{' '} */}
                    {activity.platform.charAt(0).toUpperCase() + activity.platform.slice(1)}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activity.type === 'published' ? 'bg-green-50 text-green-600' :
                    activity.type === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {getStatusText(activity.type)}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-[#181817] text-sm mb-2 line-clamp-2">
                  {activity.content}
                </p>

                {/* Metrics & Timestamp */}
                <div className="flex items-center justify-between">
                  <span className="text-[#4D4946]/60 text-xs">
                    {formatTimestamp(activity.timestamp)}
                  </span>

                  {activity.metrics && (
                    <div className="flex items-center gap-3 text-xs text-[#4D4946]/70">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {activity.metrics.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        ❤️ {activity.metrics.engagement}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-[#4D4946]/30 mx-auto mb-3" />
          <p className="text-[#4D4946] text-sm">No recent activity</p>
          <p className="text-[#4D4946]/60 text-xs mt-1">
            Your posts will appear here once you start publishing
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;