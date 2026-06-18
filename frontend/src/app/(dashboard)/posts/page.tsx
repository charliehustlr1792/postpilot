// app/(dashboard)/posts/page.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Search, Grid3x3, List } from 'lucide-react';
import PostCard from '@/components/dashboard/PostCard';
import CreatePostModal from '@/components/posts/CreatePostModal';
//import PostFilters from '@/components/posts/PostFilters';
import { Post, Platform, PostStatus } from '@/types/post';

const PostsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'ALL'>('ALL');
  //const [showFilters, setShowFilters] = useState(false);

  // Mock posts data — replace with real API data in Sprint 2.
  // Shape matches the backend API response exactly (single platform, uppercase enums, ISO date strings).
  const mockPosts: Post[] = [
    {
      id: '1',
      content: 'Just launched our new AI-powered analytics dashboard! 🚀 Check it out and let us know what you think. #tech #analytics #AI',
      platform: 'TWITTER',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      scheduledAt: null,
      images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      userId: 'user1',
      accountId: 'acc1',
      account: { platform: 'TWITTER', username: '@postpilot', displayName: 'PostPilot' },
      analytics: [{ id: 'a1', impressions: 2450, likes: 89, comments: 12, shares: 23, clicks: 156, reach: 1800, saves: 5, engagementRate: 7.2, ctr: 6.4, recordedAt: new Date().toISOString() }],
    },
    {
      id: '2',
      content: 'Behind the scenes of our product development process. Swipe to see more! 📱 #startup #productdev',
      platform: 'INSTAGRAM',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      scheduledAt: null,
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      userId: 'user1',
      accountId: 'acc2',
      account: { platform: 'INSTAGRAM', username: 'postpilot', displayName: 'PostPilot' },
      analytics: [{ id: 'a2', impressions: 3200, likes: 156, comments: 28, shares: 45, clicks: 89, reach: 2600, saves: 34, engagementRate: 9.8, ctr: 2.8, recordedAt: new Date().toISOString() }],
    },
    {
      id: '3',
      content: 'Exciting news coming next week! Stay tuned 👀 #announcement',
      platform: 'LINKEDIN',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      publishedAt: null,
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      userId: 'user1',
      accountId: 'acc3',
      account: { platform: 'LINKEDIN', username: 'postpilot', displayName: 'PostPilot' },
    },
    {
      id: '4',
      content: 'Working on something amazing. Draft post to refine later.',
      platform: 'TWITTER',
      status: 'DRAFT',
      scheduledAt: null,
      publishedAt: null,
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      userId: 'user1',
      accountId: 'acc1',
      account: { platform: 'TWITTER', username: '@postpilot', displayName: 'PostPilot' },
    },
    {
      id: '5',
      content: "Weekend vibes! What's everyone working on? 🌟",
      platform: 'FACEBOOK',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      scheduledAt: null,
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      userId: 'user1',
      accountId: 'acc4',
      account: { platform: 'FACEBOOK', username: 'PostPilot', displayName: 'PostPilot' },
      analytics: [{ id: 'a5', impressions: 5600, likes: 234, comments: 45, shares: 67, clicks: 123, reach: 4200, saves: 18, engagementRate: 8.3, ctr: 2.2, recordedAt: new Date().toISOString() }],
    },
    {
      id: '6',
      content: 'Check out our latest blog post about social media marketing trends in 2025! Link in bio 🔗',
      platform: 'LINKEDIN',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      publishedAt: null,
      images: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      userId: 'user1',
      accountId: 'acc3',
      account: { platform: 'LINKEDIN', username: 'postpilot', displayName: 'PostPilot' },
    },
  ];

  const filterPosts = (posts: Post[]) => {
    let filtered = posts;

    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(post => post.status === activeFilter);
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
    return mockPosts.filter(post => post.status === status).length;
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