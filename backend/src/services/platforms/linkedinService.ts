import axios from 'axios';
import { PublishablePost } from '../../types/post';
import { PublishResult } from '../../types/publishResult';
import { PlatformPublishError } from '../../types/publishError';
import { InsightsResult } from '../../types/insights';

// LinkedIn only keeps ~12 monthly versions (YYYYMM) active and deprecates older
// ones, so this is env-overridable — bump LINKEDIN_API_VERSION to the current
// version from LinkedIn's changelog without a code change when it rotates.
const LINKEDIN_VERSION = process.env.LINKEDIN_API_VERSION ?? '202605';
const LINKEDIN_MAX_CHARS = 3000;

// Publishes a text post to LinkedIn via the Posts API, authored by the connected
// member (urn:li:person:{id}) using their w_member_social token.
export const publishToLinkedIn = async (post: PublishablePost): Promise<PublishResult> => {
  if (post.content.length > LINKEDIN_MAX_CHARS) {
    throw new Error(`LinkedIn posts cannot exceed ${LINKEDIN_MAX_CHARS} characters`);
  }
  // Attaching media requires registering and uploading an image asset first
  // (a separate flow), so fail loudly rather than drop the images.
  if (post.images && post.images.length > 0) {
    throw new Error('Publishing images to LinkedIn is not supported yet');
  }
  if (!post.account.platformAccountId) {
    throw new Error('LinkedIn account is missing its member id; reconnect the account');
  }

  const authorUrn = `urn:li:person:${post.account.platformAccountId}`;

  try {
    const response = await axios.post(
      'https://api.linkedin.com/rest/posts',
      {
        author: authorUrn,
        commentary: post.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      },
      {
        headers: {
          Authorization: `Bearer ${post.account.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': LINKEDIN_VERSION,
        },
      }
    );

    // The created post URN comes back in the x-restli-id response header.
    const postUrn = response.headers['x-restli-id'] as string | undefined;
    return {
      platformPostId: postUrn ?? authorUrn,
      url: postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : undefined,
      success: true,
      message: 'Successfully posted to LinkedIn',
    };
  } catch (error) {
    throw toLinkedInError(error);
  }
};

// Fetches engagement metrics for a member post via the socialActions summary.
// Impressions/clicks aren't exposed for member posts under standard scopes
// (those require organization analytics), so only likes/comments are returned.
export async function fetchLinkedInInsights(
  postUrn: string,
  accessToken: string
): Promise<InsightsResult> {
  const { data } = await axios.get<{
    likesSummary?: { totalLikes?: number };
    commentsSummary?: { aggregatedTotalComments?: number };
  }>(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(postUrn)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': LINKEDIN_VERSION,
    },
  });

  return {
    likes: data.likesSummary?.totalLikes,
    comments: data.commentsSummary?.aggregatedTotalComments,
  };
}

// Turns a LinkedIn API failure into a typed, recordable error.
function toLinkedInError(error: unknown): PlatformPublishError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (status === 401) {
      return new PlatformPublishError(
        `LinkedIn authentication failed; the access token is invalid or expired${message ? `: ${message}` : ''}`,
        true
      );
    }
    if (status === 429) {
      // Rate limit is transient — let BullMQ retry with backoff.
      return new PlatformPublishError('LinkedIn API rate limit exceeded; try again later');
    }
    // Any other 4xx (e.g. a deprecated LinkedIn-Version, malformed post) is a
    // client-side condition a retry cannot resolve; 5xx/network is transient.
    const isPermanent = typeof status === 'number' && status >= 400 && status < 500;
    return new PlatformPublishError(
      message ? `LinkedIn API error: ${message}` : `LinkedIn API error${status ? ` (HTTP ${status})` : ''}`,
      false,
      isPermanent
    );
  }
  return new PlatformPublishError(
    error instanceof Error ? error.message : 'Unknown LinkedIn API error'
  );
}
