// Canonical platform and status types — uppercase strings matching the backend Prisma enums exactly.
// The backend supports 4 platforms. Any additional platforms (TikTok, Pinterest, etc.)
// must be added to the backend schema first before adding them here.
export type Platform = 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

// The account fields included on a target (not the full SocialAccount).
export interface PostAccount {
  id: string;
  platform: Platform;
  username: string;
  displayName: string | null;
}

// Analytics snapshot for a single target measurement point.
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

// One delivery of a Post to a single platform/account.
// Status, scheduling and publish results live here — each platform is independent.
export interface PostTarget {
  id: string;
  platform: Platform;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  platformPostId: string | null;
  url: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  postId: string;
  accountId: string;
  account: PostAccount;
  // Only populated on single-post fetches (GET /api/posts/:id)
  analytics?: PostAnalytics[];
}

// The logical post the user authors once. It fans out to one target per platform.
// Dates are ISO strings as returned by JSON serialisation.
export interface Post {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  targets: PostTarget[];
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
// Selecting multiple platforms creates one Post with one target per chosen account.
export interface CreatePostFormData {
  content: string;
  socialAccountIds: string[];
  scheduledAt: string | null;
  images: string[];
}

// ---------------------------------------------------------------------------
// Derived helpers for working with a post's targets in the UI.
// ---------------------------------------------------------------------------

// The distinct platforms a post is delivered to.
export function postPlatforms(post: Post): Platform[] {
  return Array.from(new Set(post.targets.map((t) => t.platform)));
}

// A single rolled-up status for a post across all its targets, for list badges.
// Priority: FAILED > SCHEDULED > PUBLISHED > DRAFT.
export function postRollupStatus(post: Post): PostStatus {
  const statuses = new Set(post.targets.map((t) => t.status));
  if (statuses.has('FAILED')) return 'FAILED';
  if (statuses.has('SCHEDULED')) return 'SCHEDULED';
  if (statuses.has('PUBLISHED')) return 'PUBLISHED';
  return 'DRAFT';
}
