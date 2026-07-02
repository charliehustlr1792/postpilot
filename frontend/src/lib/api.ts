import type {Post,SocialAccount,User,Plan,PostStatus,Platform,PostAnalytics,} from '@/types/post';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface PostResponse {
  post: Post;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScheduledPostsResponse {
  posts: Post[];
}

export interface SchedulePostResponse {
  message: string;
  post: Post;
  scheduledAt: string;
  scheduledTargets: number;
}

// DELETE /api/posts/:id/schedule  |  POST .../duplicate
export interface MessagePostResponse {
  message: string;
  post: Post;
}

// DELETE /api/posts/:id
export interface DeletePostResponse {
  message: string;
}

// GET /api/posts/:id/analytics
export interface PostAnalyticsResponse {
  analytics: PostAnalytics[];
}

// One entry per platform that has analytics in the window.
export interface PlatformBreakdownItem {
  platform: Platform;
  impressions: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  reach: number;
  saves: number;
  engagement: number;
  posts: number;
}

// GET /api/analytics/overview
export interface AnalyticsOverviewResponse {
  overview: {
    totalImpressions: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    totalClicks: number;
    totalReach: number;
    totalSaves: number;
    avgEngagementRate: number;
    avgCTR: number;
  };
  topPosts: Post[];
  platformBreakdown: PlatformBreakdownItem[];
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// GET /api/analytics/trends
export interface TrendDataPoint {
  date: string;
  impressions: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  reach: number;
  engagementRate: number;
  ctr: number;
}

export interface AnalyticsTrendsResponse {
  trends: TrendDataPoint[];
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// GET /api/accounts
export interface AccountsResponse {
  accounts: SocialAccount[];
}

// POST /api/accounts/connect
export interface ConnectAccountResponse {
  account: SocialAccount;
}

// DELETE /api/accounts/:id
export interface DeleteAccountResponse {
  message: string;
  account: SocialAccount;
}

// GET /api/accounts/:platform/auth
export interface OAuthUrlResponse {
  url: string;
}

// GET /api/users/me
export interface UserResponse {
  user: User;
}

// PATCH /api/users/me
export interface UpdateUserResponse {
  updatedUser: User;
}

// GET /api/users/me/stats
export interface UserStatsResponse {
  stats: {
    totalPosts: number;
    totalAccounts: number;
    plan: Plan;
    memberSince: string;
  };
}

// ---------------------------------------------------------------------------
// Request body types — used by callers when building payloads.
// ---------------------------------------------------------------------------

export interface CreatePostBody {
  content: string;
  images?: string[];
  // One target is created per account — this is how a post fans out to many platforms.
  socialAccountIds: string[];
  scheduledAt?: string;
}

export interface UpdatePostBody {
  content?: string;
  images?: string[];
  scheduledAt?: string | null;
}

export interface SchedulePostBody {
  scheduledAt: string;
  // Optional: schedule only specific targets; defaults to all non-published targets.
  targetIds?: string[];
}

export interface DuplicatePostBody {
  // Optional: retarget the duplicate to different accounts; defaults to the original's.
  socialAccountIds?: string[];
}

export interface ConnectAccountBody {
  platform: Platform;
  username: string;
  displayName?: string;
  profileImage?: string;
  accessToken: string;
  refreshToken?: string;
}

export interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface PostsQueryParams {
  status?: PostStatus;
  platform?: Platform;
  page?: number;
  limit?: number;
}

export interface AnalyticsQueryParams {
  // Number of days to look back. The backend just does Number(days), so any
  // window works; the UI uses 7 / 30 / 90 and a large value for "all time".
  days?: number;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

// Empty by default: calls go to the frontend's own origin (`/api/*`) and are
// reverse-proxied to the backend by next.config's rewrites, keeping everything
// same-origin. Set NEXT_PUBLIC_API_URL only to bypass the proxy and hit the
// backend directly.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      (body as { error?: string })?.error ?? res.statusText ?? 'Request failed';
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ---------------------------------------------------------------------------
// Typed API surface
// Each method accepts a Clerk session token as its last argument.
// Callers obtain the token via: const { getToken } = useAuth(); await getToken()
// ---------------------------------------------------------------------------

export const api = {
  // ---- Posts ---------------------------------------------------------------

  getPosts(params: PostsQueryParams = {}, token?: string | null) {
    const q = buildQuery(params as Record<string, string | number | undefined>);
    return apiFetch<PaginatedPostsResponse>(`/api/posts${q}`, {}, token);
  },

  getPost(postId: string, token?: string | null) {
    return apiFetch<PostResponse>(`/api/posts/${postId}`, {}, token);
  },

  createPost(body: CreatePostBody, token?: string | null) {
    return apiFetch<PostResponse>(
      '/api/posts',
      { method: 'POST', body: JSON.stringify(body) },
      token,
    );
  },

  updatePost(postId: string, body: UpdatePostBody, token?: string | null) {
    return apiFetch<PostResponse>(
      `/api/posts/${postId}`,
      { method: 'PATCH', body: JSON.stringify(body) },
      token,
    );
  },

  deletePost(postId: string, token?: string | null) {
    return apiFetch<DeletePostResponse>(
      `/api/posts/${postId}`,
      { method: 'DELETE' },
      token,
    );
  },

  duplicatePost(postId: string, body: DuplicatePostBody = {}, token?: string | null) {
    return apiFetch<PostResponse>(
      `/api/posts/${postId}/duplicate`,
      { method: 'POST', body: JSON.stringify(body) },
      token,
    );
  },

  // ---- Scheduling ----------------------------------------------------------

  schedulePost(postId: string, body: SchedulePostBody, token?: string | null) {
    return apiFetch<SchedulePostResponse>(
      `/api/posts/${postId}/schedule`,
      { method: 'POST', body: JSON.stringify(body) },
      token,
    );
  },

  cancelSchedule(postId: string, token?: string | null) {
    return apiFetch<MessagePostResponse>(
      `/api/posts/${postId}/schedule`,
      { method: 'DELETE' },
      token,
    );
  },

  getScheduledPosts(token?: string | null) {
    return apiFetch<ScheduledPostsResponse>('/api/scheduled-posts', {}, token);
  },

  // ---- Analytics -----------------------------------------------------------

  getAnalyticsOverview(params: AnalyticsQueryParams = {}, token?: string | null) {
    const q = buildQuery(params as Record<string, string | number | undefined>);
    return apiFetch<AnalyticsOverviewResponse>(`/api/analytics/overview${q}`, {}, token);
  },

  getAnalyticsTrends(params: AnalyticsQueryParams & { period?: string } = {}, token?: string | null) {
    const q = buildQuery(params as Record<string, string | number | undefined>);
    return apiFetch<AnalyticsTrendsResponse>(`/api/analytics/trends${q}`, {}, token);
  },

  getPostAnalytics(postId: string, token?: string | null) {
    return apiFetch<PostAnalyticsResponse>(`/api/posts/${postId}/analytics`, {}, token);
  },

  // ---- Social Accounts -----------------------------------------------------

  getAccounts(token?: string | null) {
    return apiFetch<AccountsResponse>('/api/accounts', {}, token);
  },

  connectAccount(body: ConnectAccountBody, token?: string | null) {
    return apiFetch<ConnectAccountResponse>(
      '/api/accounts/connect',
      { method: 'POST', body: JSON.stringify(body) },
      token,
    );
  },

  // Starts an OAuth connect: returns the provider consent URL to navigate to.
  // credentials are included so the backend's signed state cookie is stored.
  getOAuthUrl(platform: Platform, token?: string | null) {
    return apiFetch<OAuthUrlResponse>(
      `/api/accounts/${platform.toLowerCase()}/auth`,
      { credentials: 'include' },
      token,
    );
  },

  deleteAccount(accountId: string, token?: string | null) {
    return apiFetch<DeleteAccountResponse>(
      `/api/accounts/${accountId}`,
      { method: 'DELETE' },
      token,
    );
  },

  // ---- User ----------------------------------------------------------------

  getMe(token?: string | null) {
    return apiFetch<UserResponse>('/api/users/me', {}, token);
  },

  updateMe(body: UpdateUserBody, token?: string | null) {
    return apiFetch<UpdateUserResponse>(
      '/api/users/me',
      { method: 'PATCH', body: JSON.stringify(body) },
      token,
    );
  },

  deleteMe(token?: string | null) {
    return apiFetch<{ message: string; user: User }>(
      '/api/users/me',
      { method: 'DELETE' },
      token,
    );
  },

  getMyStats(token?: string | null) {
    return apiFetch<UserStatsResponse>('/api/users/me/stats', {}, token);
  },
};
