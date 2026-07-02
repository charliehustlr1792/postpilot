import axios from 'axios';
import { PublishablePost } from '../../types/post';
import { PublishResult } from '../../types/publishResult';
import { PlatformPublishError } from '../../types/publishError';
import { InsightsResult } from '../../types/insights';

const TWITTER_MAX_CHARS = 280;

// Posts a tweet via Twitter API v2 using the account's OAuth 2.0 user token.
export const publishToTwitter = async (post: PublishablePost): Promise<PublishResult> => {
  if (post.content.length > TWITTER_MAX_CHARS) {
    throw new Error(`Twitter posts cannot exceed ${TWITTER_MAX_CHARS} characters`);
  }
  // Tweeting media requires uploading it first to obtain media_ids (a separate
  // endpoint that isn't wired up yet), so fail loudly rather than drop images.
  if (post.images && post.images.length > 0) {
    throw new Error('Publishing images to Twitter is not supported yet');
  }

  try {
    const { data } = await axios.post<{ data: { id: string; text: string } }>(
      'https://api.twitter.com/2/tweets',
      { text: post.content },
      {
        headers: {
          Authorization: `Bearer ${post.account.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tweetId = data.data.id;
    return {
      platformPostId: tweetId,
      url: `https://twitter.com/${post.account.username}/status/${tweetId}`,
      success: true,
      message: 'Successfully posted to Twitter',
    };
  } catch (error) {
    throw toTwitterError(error);
  }
};

// Fetches engagement metrics for a tweet via its public_metrics.
export async function fetchTwitterInsights(
  tweetId: string,
  accessToken: string
): Promise<InsightsResult> {
  const { data } = await axios.get<{
    data?: {
      public_metrics?: {
        retweet_count?: number;
        reply_count?: number;
        like_count?: number;
        quote_count?: number;
        impression_count?: number;
        bookmark_count?: number;
      };
    };
  }>(`https://api.twitter.com/2/tweets/${tweetId}`, {
    params: { 'tweet.fields': 'public_metrics' },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const m = data.data?.public_metrics;
  if (!m) return {};
  return {
    impressions: m.impression_count,
    likes: m.like_count,
    comments: m.reply_count,
    shares: (m.retweet_count ?? 0) + (m.quote_count ?? 0),
    saves: m.bookmark_count,
  };
}

// Turns a Twitter API failure into a typed, recordable error.
function toTwitterError(error: unknown): PlatformPublishError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { detail?: string; title?: string; errors?: { message?: string }[] }
      | undefined;
    const detail = data?.detail || data?.title || data?.errors?.[0]?.message;

    switch (status) {
      case 401:
        return new PlatformPublishError(
          `Twitter authentication failed; the access token is invalid or expired${detail ? `: ${detail}` : ''}`,
          true
        );
      case 403:
        return new PlatformPublishError(
          `Twitter rejected the post${detail ? `: ${detail}` : ' (duplicate content or insufficient permissions)'}`
        );
      case 429:
        return new PlatformPublishError('Twitter API rate limit exceeded; try again later');
      default:
        return new PlatformPublishError(
          detail ? `Twitter API error: ${detail}` : `Twitter API error${status ? ` (HTTP ${status})` : ''}`
        );
    }
  }
  return new PlatformPublishError(
    error instanceof Error ? error.message : 'Unknown Twitter API error'
  );
}
