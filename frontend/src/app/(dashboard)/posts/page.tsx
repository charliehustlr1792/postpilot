// app/(dashboard)/posts/page.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Search, Grid3x3, List } from 'lucide-react';
import { toast } from 'sonner';
import PostCard from '@/components/dashboard/PostCard';
import CreatePostModal from '@/components/posts/CreatePostModal';
//import PostFilters from '@/components/posts/PostFilters';
import { Post, PostStatus } from '@/types/post';
import { usePosts } from '@/hooks/usePosts';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

const PostsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PostStatus | 'ALL'>('ALL');
  //const [showFilters, setShowFilters] = useState(false);

  // Real data from the backend (Model B: each post carries its own targets[]).
  // Status/search filtering stays client-side here so the tab counts stay accurate;
  // a high limit keeps the whole list on one page for now (pagination UI is later).
  const { posts, isLoading, error, refetch, deletePost, duplicatePost } = usePosts({ limit: 100 });

  const filterPosts = (list: Post[]) => {
    let filtered = list;

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

  const filteredPosts = filterPosts(posts);

  const getStatusCount = (status: PostStatus | 'ALL') => {
    if (status === 'ALL') return posts.length;
    return posts.filter(post => post.targets.some(t => t.status === status)).length;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post and all of its targets? This cannot be undone.')) return;
    try {
      await deletePost(id);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePost(id);
      toast.success('Post duplicated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate post');
    }
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
      {isLoading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load posts" message={error} onRetry={refetch} />
      ) : filteredPosts.length === 0 ? (
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
              // Edit reuses CreatePostModal in 2.3 (no edit UI yet).
              onEdit={() => console.log('Edit post:', post.id)}
              onDelete={() => handleDelete(post.id)}
              onDuplicate={() => handleDuplicate(post.id)}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default PostsPage;