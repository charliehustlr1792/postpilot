'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, Clock, XCircle, Eye, ArrowRight } from 'lucide-react';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { Platform, Post, postRollupStatus } from '@/types/post';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'published' | 'scheduled' | 'failed';
  platform: Platform;
  content: string;
  timestamp: Date;
  metrics?: {
    views: number;
    engagement: number;
  };
}

function activitiesFromPosts(posts: Post[]): Activity[] {
  const items: Activity[] = [];
  for (const post of posts) {
    const rollup = postRollupStatus(post);
    if (rollup === 'DRAFT') continue;
    for (const target of post.targets) {
      if (target.status === 'DRAFT') continue;
      const type =
        target.status === 'FAILED'
          ? 'failed'
          : target.status === 'SCHEDULED'
            ? 'scheduled'
            : 'published';
      const latest = target.analytics?.[0];
      items.push({
        id: target.id,
        type,
        platform: target.platform,
        content: post.content,
        timestamp: new Date(
          target.publishedAt ?? target.scheduledAt ?? target.updatedAt ?? post.createdAt,
        ),
        metrics: latest
          ? {
              views: latest.impressions,
              engagement: latest.likes + latest.shares + latest.comments,
            }
          : undefined,
      });
    }
  }
  return items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
}

const RecentActivity = () => {
  const { getToken, isLoaded } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setActivities([]);
        return;
      }
      const { posts } = await api.getPosts({ limit: 20 }, token);
      setActivities(activitiesFromPosts(posts));
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    load();
  }, [load]);

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
      if (minutes < 60) return `in ${minutes}m`;
      if (hours < 24) return `in ${hours}h`;
      return `in ${days}d`;
    }
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#181817] text-lg font-bold">Recent Activity</h2>
        <Link
          href="/posts"
          className="text-[#FF6E00] text-sm font-medium hover:text-[#FF9B4F] transition-colors flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {isLoading ? (
        <p className="text-[#4D4946]/60 text-sm py-8 text-center">Loading activity...</p>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-[#4D4946]/30 mx-auto mb-3" />
          <p className="text-[#4D4946] text-sm">No recent activity</p>
          <p className="text-[#4D4946]/60 text-xs mt-1">
            Your posts will appear here once you start publishing
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group p-4 rounded-xl border border-[#EAE7E4] hover:border-[#FF9B4F] hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(activity.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: PLATFORM_COLORS[activity.platform] }}
                    >
                      <PlatformIcon platform={activity.platform} className="w-3 h-3" />
                      {PLATFORM_LABELS[activity.platform]}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'published'
                          ? 'bg-green-50 text-green-600'
                          : activity.type === 'scheduled'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {getStatusText(activity.type)}
                    </span>
                  </div>

                  <p className="text-[#181817] text-sm mb-2 line-clamp-2">{activity.content}</p>

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
      )}
    </div>
  );
};

export default RecentActivity;
