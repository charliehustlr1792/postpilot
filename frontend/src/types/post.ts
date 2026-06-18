// Canonical platform and status types — uppercase strings matching the backend Prisma enums exactly.
// The backend supports 4 platforms. Any additional platforms (TikTok, Pinterest, etc.)
// must be added to the backend schema first before adding them here.
export type Platform = 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

// The account fields included on a Post response (not the full SocialAccount).
export interface PostAccount {
  platform: Platform;
  username: string;
  displayName: string | null;
}

// Analytics snapshot for a single measurement point.
export interface PostAnalytics {
  id: string;
  impressions: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  reach: number;
  saves: number;
  engagementRate: number;
  ctr: number;
  recordedAt: string;
}

// Mirrors the backend DB Post record: one post belongs to one platform + one social account.
// Dates are ISO strings as returned by JSON serialisation.
export interface Post {
  id: string;
  content: string;
  images: string[];
  platform: Platform;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  accountId: string;
  account: PostAccount;
  // Only populated on single-post fetches (GET /api/posts/:id)
  analytics?: PostAnalytics[];
}

// Connected social media account.
export interface SocialAccount {
  id: string;
  platform: Platform;
  username: string;
  displayName: string | null;
  profileImage: string | null;
  isActive: boolean;
  createdAt: string;
}

// Authenticated user.
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

// UI-only type for the Create/Edit Post form.
// Selecting multiple platforms in the form creates one Post record per platform.
export interface CreatePostFormData {
  content: string;
  platforms: Platform[];
  accountIds: string[];
  scheduledAt: string | null;
  images: string[];
}
