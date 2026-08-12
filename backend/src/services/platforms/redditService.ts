import axios from 'axios';
import { PublishablePost } from '../../types/post';
import { PublishResult } from '../../types/publishResult';
import { PlatformPublishError } from '../../types/publishError';
import { InsightsResult } from '../../types/insights';
import { REDDIT_USER_AGENT } from '../oauth/reddit';

const REDDIT_API = 'https://oauth.reddit.com';
const REDDIT_TITLE_MAX = 300;
const REDDIT_TEXT_MAX = 40000;

interface RedditSubmitResponse {
    json?: {
        errors?: [string, string, string?][];
        data?: { url?: string; id?: string; name?: string };
    };
}

// Publishes a self (text) post to the connected user's profile (u/<username>),
// which Reddit exposes as the subreddit `u_<username>`. Subreddit targeting is a
// later enhancement; for now every post lands on the member's own profile.
export const publishToReddit = async (post: PublishablePost): Promise<PublishResult> => {
    if (post.content.length > REDDIT_TEXT_MAX) {
        throw new Error(`Reddit posts cannot exceed ${REDDIT_TEXT_MAX} characters`);
    }
    if (post.images && post.images.length > 0) {
        // Image posts use a separate media-upload flow, so fail loudly.
        throw new Error('Publishing images to Reddit is not supported yet');
    }

    // Reddit posts require a title; derive it from the content (capped at 300).
    const title = post.content.slice(0, REDDIT_TITLE_MAX);
    const body = new URLSearchParams({
        api_type: 'json',
        sr: `u_${post.account.username}`,
        kind: 'self',
        title,
        text: post.content,
    });

    let data: RedditSubmitResponse;
    try {
        const response = await axios.post<RedditSubmitResponse>(
            `${REDDIT_API}/api/submit`,
            body.toString(),
            {
                headers: {
                    Authorization: `Bearer ${post.account.accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': REDDIT_USER_AGENT,
                },
            }
        );
        data = response.data;
    } catch (error) {
        throw toRedditError(error);
    }

    // Reddit returns 200 with a `json.errors` array on logical failures
    // (e.g. RATELIMIT, USER_REQUIRED) rather than an HTTP error status.
    const errors = data.json?.errors ?? [];
    if (errors.length > 0) {
        throw toRedditSubmitError(errors);
    }

    const result = data.json?.data;
    return {
        // `name` is the post fullname (t3_xxx), used later to fetch insights.
        platformPostId: result?.name ?? result?.id ?? '',
        url: result?.url,
        success: true,
        message: 'Successfully posted to Reddit',
    };
};

// Fetches engagement metrics for a post via /api/info (needs the `read` scope).
export async function fetchRedditInsights(
    fullname: string,
    accessToken: string
): Promise<InsightsResult> {
    const { data } = await axios.get<{
        data?: {
            children?: {
                data?: {
                    ups?: number;
                    score?: number;
                    num_comments?: number;
                    view_count?: number | null;
                };
            }[];
        };
    }>(`${REDDIT_API}/api/info`, {
        params: { id: fullname },
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': REDDIT_USER_AGENT,
        },
    });

    const m = data.data?.children?.[0]?.data;
    if (!m) return {};
    return {
        // Reddit rarely exposes impressions (view_count) outside of mod tools.
        impressions: m.view_count ?? undefined,
        likes: m.ups ?? m.score,
        comments: m.num_comments,
        shares: 0,
    };
}

// Maps Reddit's in-body `json.errors` to a typed error. RATELIMIT is transient;
// everything else (bad token, banned, invalid content) won't fix on retry.
function toRedditSubmitError(errors: [string, string, string?][]): PlatformPublishError {
    const codes = errors.map((e) => e[0]);
    const detail = errors.map((e) => e[1]).filter(Boolean).join('; ') || codes.join('; ');

    if (codes.includes('RATELIMIT')) {
        return new PlatformPublishError(`Reddit rate limit: ${detail}`);
    }
    if (codes.includes('USER_REQUIRED')) {
        return new PlatformPublishError(`Reddit authentication failed: ${detail}`, true);
    }
    return new PlatformPublishError(`Reddit rejected the post: ${detail}`, false, true);
}

// Maps a transport-level Reddit failure into a typed, recordable error.
function toRedditError(error: unknown): PlatformPublishError {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const detail = (error.response?.data as { message?: string } | undefined)?.message;

        if (status === 401) {
            return new PlatformPublishError(
                `Reddit authentication failed; the access token is invalid or expired${detail ? `: ${detail}` : ''}`,
                true
            );
        }
        if (status === 429) {
            return new PlatformPublishError('Reddit API rate limit exceeded; try again later');
        }
        // Other 4xx are client-side and won't resolve on retry; 5xx is transient.
        const isPermanent = typeof status === 'number' && status >= 400 && status < 500;
        return new PlatformPublishError(
            detail ? `Reddit API error: ${detail}` : `Reddit API error${status ? ` (HTTP ${status})` : ''}`,
            false,
            isPermanent
        );
    }
    return new PlatformPublishError(
        error instanceof Error ? error.message : 'Unknown Reddit API error'
    );
}
