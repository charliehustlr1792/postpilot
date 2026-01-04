// components/dashboard/PostCard.tsx
'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, Copy, MoreVertical, Eye, Heart, MessageCircle, Share2, Calendar as CalendarIcon } from 'lucide-react';
import { Post } from '@/types/post';
import { PLATFORM_COLORS, POST_STATUS_COLORS } from '@/lib/constants';
import { formatDateTime, getRelativeTime, formatNumber } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, viewMode, onEdit, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusInfo = () => {
    switch (post.status) {
      case 'published':
        return {
          label: 'Published',
          time: post.publishedAt ? getRelativeTime(post.publishedAt) : '',
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          time: post.scheduledAt ? formatDateTime(post.scheduledAt) : '',
        };
      case 'draft':
        return {
          label: 'Draft',
          time: `Updated ${getRelativeTime(post.updatedAt)}`,
        };
      case 'failed':
        return {
          label: 'Failed',
          time: 'Retry needed',
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-4 hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 group">
        <div className="flex gap-4">
          {/* Image Thumbnail */}
          {post.images && post.images.length > 0 && (
            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
              <img
                src={post.images[0]}
                alt="Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Platform Badges */}
                {post.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                  >
                  {/* {PLATFORM_ICONS[platform]} */}
                  </span>
                ))}
                {/* Status Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${POST_STATUS_COLORS[post.status]}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-[#4D4946]" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-[#EAE7E4] shadow-lg z-10">
                    <button
                      onClick={() => { onEdit(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#4D4946] hover:bg-[#F3EFEC] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => { onDuplicate(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#4D4946] hover:bg-[#F3EFEC] transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => { onDelete(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            <p className="text-[#181817] text-sm mb-2 line-clamp-2">{post.content}</p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[#4D4946]/60 text-xs">{statusInfo.time}</span>

              {/* Metrics */}
              {post.metrics && (
                <div className="flex items-center gap-4 text-xs text-[#4D4946]/70">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(post.metrics.impressions)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {formatNumber(post.metrics.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {formatNumber(post.metrics.comments)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {formatNumber(post.metrics.shares)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] overflow-hidden hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      {post.images && post.images.length > 0 && (
        <div className="aspect-video w-full overflow-hidden bg-[#F3EFEC]">
          <img
            src={post.images[0]}
            alt="Post"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform Badges */}
            {post.platforms.map((platform) => (
              <span
                key={platform}
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: PLATFORM_COLORS[platform] }}
              >
                {/* {PLATFORM_ICONS[platform]} */}
              </span>
            ))}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-[#F3EFEC] rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-[#4D4946]" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-[#EAE7E4] shadow-lg z-10">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#4D4946] hover:bg-[#F3EFEC] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => { onDuplicate(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#4D4946] hover:bg-[#F3EFEC] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-[#181817] text-sm mb-3 line-clamp-3">{post.content}</p>

        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${POST_STATUS_COLORS[post.status]}`}>
            {statusInfo.label}
          </span>
          <span className="text-[#4D4946]/60 text-xs">{statusInfo.time}</span>
        </div>

        {/* Metrics */}
        {post.metrics && (
          <div className="flex items-center justify-between pt-3 border-t border-[#EAE7E4] text-xs text-[#4D4946]/70">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(post.metrics.impressions)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(post.metrics.likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(post.metrics.comments)}
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              {formatNumber(post.metrics.shares)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;