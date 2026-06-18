// app/(dashboard)/posts/page.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Search, Grid3x3, List } from 'lucide-react';
import PostCard from '@/components/dashboard/PostCard';
import CreatePostModal from '@/components/posts/CreatePostModal';
//import PostFilters from '@/components/posts/PostFilters';
import { Post, PostTarget, Platform, PostStatus } from '@/types/post';

const PostsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'ALL'>('ALL');
  //const [showFilters, setShowFilters] = useState(false);

  // Mock posts data — replace with real API data in Sprint 2.
  // Shape matches the backend API response exactly: a Post fans out to one
  // PostTarget per platform, each with its own status / schedule / analytics.
  const mockPosts: Post[] = React.useMemo(() => {
    const now = Date.now();
    const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
    const isoIn = (msAhead: number) => new Date(now + msAhead).toISOString();

    let targetSeq = 0;
    const mkTarget = (
      postId: string,
      platform: Platform,
      status: PostStatus,
      opts: {
        scheduledAt?: string | null;
        publishedAt?: string | null;
        username?: string;
        analytics?: PostTarget['analytics'];
      } = {},
    ): PostTarget => {
      const id = `t${++targetSeq}`;
      return {
        id,
        platform,
        status,
        scheduledAt: opts.scheduledAt ?? null,
        publishedAt: opts.publishedAt ?? null,
        platformPostId: status === 'PUBLISHED' ? `${platform.toLowerCase()}_${id}` : null,
        url: null,
        error: null,
        createdAt: iso(1000 * 60 * 60 * 24),
        updatedAt: iso(1000 * 60 * 60),
        postId,
        accountId: `acc-${platform}`,
        account: { id: `acc-${platform}`, platform, username: opts.username ?? 'postpilot', displayName: 'PostPilot' },
        analytics: opts.analytics,
      };
    };

    const a = (impressions: number, likes: number, comments: number, shares: number): PostTarget['analytics'] => [
      { id: `an${++targetSeq}`, impressions, likes, comments, shares, clicks: Math.round(impressions * 0.04), reach: Math.round(impressions * 0.8), saves: Math.round(likes * 0.1), engagementRate: 8, ctr: 2.5, recordedAt: iso(0) },
    ];

    return [
      {
        id: '1',
        content: 'Just launched our new AI-powered analytics dashboard! 🚀 Check it out and let us know what you think. #tech #analytics #AI',
        images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400'],
        createdAt: iso(1000 * 60 * 60 * 24 * 2),
        updatedAt: iso(1000 * 60 * 60 * 2),
        userId: 'user1',
        targets: [
          mkTarget('1', 'TWITTER', 'PUBLISHED', { publishedAt: iso(1000 * 60 * 60 * 2), username: '@postpilot', analytics: a(2450, 89, 12, 23) }),
          mkTarget('1', 'LINKEDIN', 'PUBLISHED', { publishedAt: iso(1000 * 60 * 60 * 2), analytics: a(1800, 64, 9, 14) }),
        ],
      },
      {
        id: '2',
        content: 'Behind the scenes of our product development process. Swipe to see more! 📱 #startup #productdev',
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'],
        createdAt: iso(1000 * 60 * 60 * 24 * 3),
        updatedAt: iso(1000 * 60 * 60 * 5),
        userId: 'user1',
        targets: [
          mkTarget('2', 'INSTAGRAM', 'PUBLISHED', { publishedAt: iso(1000 * 60 * 60 * 5), analytics: a(3200, 156, 28, 45) }),
          mkTarget('2', 'FACEBOOK', 'PUBLISHED', { publishedAt: iso(1000 * 60 * 60 * 5), analytics: a(1500, 70, 11, 19) }),
        ],
      },
      {
        id: '3',
        content: 'Exciting news coming next week! Stay tuned 👀 #announcement',
        images: [],
        createdAt: iso(1000 * 60 * 60 * 12),
        updatedAt: iso(1000 * 60 * 60 * 12),
        userId: 'user1',
        targets: [
          mkTarget('3', 'TWITTER', 'SCHEDULED', { scheduledAt: isoIn(1000 * 60 * 60 * 24), username: '@postpilot' }),
          mkTarget('3', 'INSTAGRAM', 'SCHEDULED', { scheduledAt: isoIn(1000 * 60 * 60 * 24) }),
          mkTarget('3', 'LINKEDIN', 'SCHEDULED', { scheduledAt: isoIn(1000 * 60 * 60 * 24) }),
        ],
      },
      {
        id: '4',
        content: 'Working on something amazing. Draft post to refine later.',
        images: [],
        createdAt: iso(1000 * 60 * 60 * 6),
        updatedAt: iso(1000 * 60 * 60 * 1),
        userId: 'user1',
        targets: [mkTarget('4', 'TWITTER', 'DRAFT', { username: '@postpilot' })],
      },
      {
        id: '5',
        content: "Weekend vibes! What's everyone working on? 🌟",
        images: [],
        createdAt: iso(1000 * 60 * 60 * 24 * 3),
        updatedAt: iso(1000 * 60 * 60 * 24 * 2),
        userId: 'user1',
        targets: [
          mkTarget('5', 'TWITTER', 'PUBLISHED', { publishedAt: iso(1000 * 60 * 60 * 24 * 2), username: '@postpilot', analytics: a(5600, 234, 45, 67) }),
          // One target failed independently — demonstrates the Model B value.
          mkTarget('5', 'FACEBOOK', 'FAILED'),
        ],
      },
      {
        id: '6',
        content: 'Check out our latest blog post about social media marketing trends in 2025! Link in bio 🔗',
        images: [],
        createdAt: iso(1000 * 60 * 60 * 24),
        updatedAt: iso(1000 * 60 * 60 * 24),
        userId: 'user1',
        targets: [
          mkTarget('6', 'LINKEDIN', 'SCHEDULED', { scheduledAt: isoIn(1000 * 60 * 60 * 48) }),
          mkTarget('6', 'FACEBOOK', 'SCHEDULED', { scheduledAt: isoIn(1000 * 60 * 60 * 48) }),
        ],
      },
    ];
  }, []);

  const filterPosts = (posts: Post[]) => {
    let filtered = posts;

    // A post matches a status filter if any of its targets has that status.
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(post => post.targets.some(t => t.status === activeFilter));
    }

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPosts = filterPosts(mockPosts);

  const getStatusCount = (status: PostStatus | 'ALL') => {
    if (status === 'ALL') return mockPosts.length;
    return mockPosts.filter(post => post.targets.some(t => t.status === status)).length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181817]">Posts</h1>
          <p className="text-[#4D4946] text-sm mt-1">
            Manage and track all your social media posts
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4D4946]/40" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#EAE7E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9B4F] focus:border-transparent"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['ALL', 'PUBLISHED', 'SCHEDULED', 'DRAFT', 'FAILED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === status
                    ? 'bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white'
                    : 'bg-[#F3EFEC] text-[#4D4946] hover:bg-[#EAE7E4]'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()} ({getStatusCount(status)})
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-[#F3EFEC] rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#FF6E00] shadow-sm'
                  : 'text-[#4D4946] hover:text-[#FF6E00]'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#FF6E00] shadow-sm'
                  : 'text-[#4D4946] hover:text-[#FF6E00]'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts Grid/List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EAE7E4] p-12 text-center">
          <div className="w-16 h-16 bg-[#F3EFEC] rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-[#4D4946]/40" />
          </div>
          <h3 className="text-[#181817] font-semibold text-lg mb-2">No posts found</h3>
          <p className="text-[#4D4946]/70 text-sm mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first post to get started'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              viewMode={viewMode}
              onEdit={() => console.log('Edit post:', post.id)}
              onDelete={() => console.log('Delete post:', post.id)}
              onDuplicate={() => console.log('Duplicate post:', post.id)}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(postData) => {
          console.log('Save post:', postData);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default PostsPage;