export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'pinterest' | 'reddit';

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  metrics?: PostMetrics;
}

export interface PostMetrics {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
}