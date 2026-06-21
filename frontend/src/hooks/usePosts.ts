'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import type {
  CreatePostBody,
  UpdatePostBody,
  DuplicatePostBody,
} from '@/lib/api';
import type { Post, PostStatus, Platform } from '@/types/post';

export interface UsePostsParams {
  status?: PostStatus;
  platform?: Platform;
  page?: number;
  limit?: number;
}

export interface UsePostsResult {
  posts: Post[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPost: (body: CreatePostBody) => Promise<Post>;
  updatePost: (id: string, body: UpdatePostBody) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  duplicatePost: (id: string, body?: DuplicatePostBody) => Promise<Post>;
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

/**
 * Fetches the current user's posts (Model B: each post carries its own targets[]).
 *
 * Status/platform filters are passed straight to the backend, which matches a post
 * if any of its targets matches. Use postRollupStatus() / postPlatforms() in the UI
 * to render a single badge per post.
 *
 * Mutations (create/update/delete/duplicate) refresh the list on success so the
 * caller never has to reconcile local state by hand.
 */
export function usePosts(params: UsePostsParams = {}): UsePostsResult {
  const { status, platform, page = 1, limit = 20 } = params;
  const { getToken } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await api.getPosts({ status, platform, page, limit }, token);
      setPosts(res.posts);
      setCurrentPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(toMessage(err));
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, status, platform, page, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(
    async (body: CreatePostBody): Promise<Post> => {
      const token = await getToken();
      const { post } = await api.createPost(body, token);
      await fetchPosts();
      return post;
    },
    [getToken, fetchPosts],
  );

  const updatePost = useCallback(
    async (id: string, body: UpdatePostBody): Promise<Post> => {
      const token = await getToken();
      const { post } = await api.updatePost(id, body, token);
      await fetchPosts();
      return post;
    },
    [getToken, fetchPosts],
  );

  const deletePost = useCallback(
    async (id: string): Promise<void> => {
      const token = await getToken();
      await api.deletePost(id, token);
      await fetchPosts();
    },
    [getToken, fetchPosts],
  );

  const duplicatePost = useCallback(
    async (id: string, body: DuplicatePostBody = {}): Promise<Post> => {
      const token = await getToken();
      const { post } = await api.duplicatePost(id, body, token);
      await fetchPosts();
      return post;
    },
    [getToken, fetchPosts],
  );

  return {
    posts,
    page: currentPage,
    totalPages,
    isLoading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
  };
}

export default usePosts;