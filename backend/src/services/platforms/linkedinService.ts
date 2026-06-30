import axios from 'axios';
import { PublishablePost } from '../../types/post';
import { PublishResult } from '../../types/publishResult';
import { PlatformPublishError } from '../../types/publishError';

const LINKEDIN_VERSION = '202405';
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
      return new PlatformPublishError('LinkedIn API rate limit exceeded; try again later');
    }
    return new PlatformPublishError(
      message ? `LinkedIn API error: ${message}` : `LinkedIn API error${status ? ` (HTTP ${status})` : ''}`
    );
  }
  return new PlatformPublishError(
    error instanceof Error ? error.message : 'Unknown LinkedIn API error'
  );
}
