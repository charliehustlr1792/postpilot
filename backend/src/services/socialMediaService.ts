import axios from 'axios';
import prisma from '../lib/db';
import { PublishablePost } from '../types/post';
import { PublishResult } from '../types/publishResult';
import { PlatformPublishError } from '../types/publishError';
import { encrypt, decrypt } from '../lib/crypto';
import { getOAuthProvider, getProviderConfig } from './oauth';
import { Platform } from '../types/enums';

export const publishPostToSocialMedia = async (post: PublishablePost): Promise<PublishResult> => {
  try {
    console.log(`Publishing to ${post.account.platform}: ${post.content}`);  
    switch (post.account.platform) {
      case 'TWITTER': return await publishToTwitter(post);
      case 'INSTAGRAM': return await publishToInstagram(post);
      case 'LINKEDIN': return await publishToLinkedIn(post);
      case 'FACEBOOK': return await publishToFacebook(post);
      default: throw new Error(`Unsupported platform: ${post.account.platform}`);
    }
  } catch (error) {
    console.error(`Error publishing to ${post.account.platform}:`, error);
    throw error;
  }
};

// Posts a tweet via Twitter API v2 using the account's OAuth 2.0 user token.
const publishToTwitter = async (post: PublishablePost): Promise<PublishResult> => {
  if (post.content.length > 280) {
    throw new Error('Twitter posts cannot exceed 280 characters');
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

// Publishes to an Instagram Business account via the Graph API. A single image
// is a media container that gets published directly; 2–10 images become a
// carousel (one child container per image, then a CAROUSEL parent). Uses the
// linked Facebook Page's access token (stored at connect time) and the IG
// Business account id (platformAccountId).
const GRAPH_API = 'https://graph.facebook.com/v21.0';
const IG_CAROUSEL_MAX = 10;

// Creates a media container and returns its id.
async function createIgContainer(
  igUserId: string,
  accessToken: string,
  params: Record<string, string | boolean>
): Promise<string> {
  const { data } = await axios.post<{ id: string }>(
    `${GRAPH_API}/${igUserId}/media`,
    null,
    { params: { ...params, access_token: accessToken } }
  );
  return data.id;
}

const publishToInstagram = async (post: PublishablePost): Promise<PublishResult> => {
  // Instagram requires at least one image, and every image must be a public URL
  // the Graph API can fetch (not a local blob).
  if (!post.images || post.images.length === 0) {
    throw new Error('Instagram posts require at least one image');
  }
  if (post.images.length > IG_CAROUSEL_MAX) {
    throw new Error(`Instagram posts cannot have more than ${IG_CAROUSEL_MAX} images`);
  }
  if (!post.images.every((url) => /^https?:\/\//i.test(url))) {
    throw new Error('Instagram requires publicly accessible image URLs');
  }
  if (!post.account.platformAccountId) {
    throw new Error('Instagram account is missing its business account id; reconnect the account');
  }

  const igUserId = post.account.platformAccountId;
  const accessToken = post.account.accessToken;

  try {
    let creationId: string;

    if (post.images.length === 1) {
      // Single image: one container carries the caption.
      creationId = await createIgContainer(igUserId, accessToken, {
        image_url: post.images[0],
        caption: post.content,
      });
    } else {
      // Carousel: a child container per image, then a CAROUSEL parent that
      // holds the caption and references the children.
      const childIds = await Promise.all(
        post.images.map((url) =>
          createIgContainer(igUserId, accessToken, {
            image_url: url,
            is_carousel_item: true,
          })
        )
      );
      creationId = await createIgContainer(igUserId, accessToken, {
        media_type: 'CAROUSEL',
        caption: post.content,
        children: childIds.join(','),
      });
    }

    // Publish the (single or carousel) container.
    const { data: published } = await axios.post<{ id: string }>(
      `${GRAPH_API}/${igUserId}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        },
      }
    );

    return {
      platformPostId: published.id,
      url: `https://www.instagram.com/${post.account.username}`,
      success: true,
      message: 'Successfully posted to Instagram',
    };
  } catch (error) {
    throw toGraphError(error, 'Instagram');
  }
};

// Turns a Meta Graph API failure into a typed, recordable error. Meta auth
// failures surface as HTTP 401 or OAuth error code 190.
function toGraphError(error: unknown, platform: string): PlatformPublishError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiError = (error.response?.data as { error?: { message?: string; code?: number } } | undefined)?.error;
    const isAuthError = status === 401 || apiError?.code === 190;
    if (apiError?.message) {
      return new PlatformPublishError(`${platform} API error: ${apiError.message}`, isAuthError);
    }
    return new PlatformPublishError(`${platform} API error${status ? ` (HTTP ${status})` : ''}`, isAuthError);
  }
  return new PlatformPublishError(
    error instanceof Error ? error.message : `Unknown ${platform} API error`
  );
}

// Publishes a text post to LinkedIn via the Posts API, authored by the connected
// member (urn:li:person:{id}) using their w_member_social token.
const LINKEDIN_VERSION = '202405';
const LINKEDIN_MAX_CHARS = 3000;

const publishToLinkedIn = async (post: PublishablePost): Promise<PublishResult> => {
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

// Publishes to a Facebook Page via the Graph API using the stored Page token and
// Page id. Text-only goes to the Page feed; a single image posts to /photos;
// multiple images are uploaded unpublished and attached to one feed post.
const publishToFacebook = async (post: PublishablePost): Promise<PublishResult> => {
  if (!post.account.platformAccountId) {
    throw new Error('Facebook account is missing its Page id; reconnect the account');
  }
  const images = post.images ?? [];
  if (images.length > 0 && !images.every((url) => /^https?:\/\//i.test(url))) {
    throw new Error('Facebook requires publicly accessible image URLs');
  }

  const pageId = post.account.platformAccountId;
  const accessToken = post.account.accessToken;

  try {
    // Single photo: post directly to /photos with the caption.
    if (images.length === 1) {
      const { data } = await axios.post<{ id: string; post_id?: string }>(
        `${GRAPH_API}/${pageId}/photos`,
        null,
        { params: { url: images[0], caption: post.content, access_token: accessToken } }
      );
      const id = data.post_id ?? data.id;
      return facebookResult(id);
    }

    // Multiple photos: upload each as unpublished to get media ids, then attach
    // them all to a single feed post.
    let params: Record<string, string> = {
      message: post.content,
      access_token: accessToken,
    };
    if (images.length > 1) {
      const mediaIds = await Promise.all(
        images.map(async (url) => {
          const { data } = await axios.post<{ id: string }>(
            `${GRAPH_API}/${pageId}/photos`,
            null,
            { params: { url, published: false, access_token: accessToken } }
          );
          return data.id;
        })
      );
      mediaIds.forEach((id, i) => {
        params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id });
      });
    }

    // Text-only or multi-photo feed post.
    const { data } = await axios.post<{ id: string }>(
      `${GRAPH_API}/${pageId}/feed`,
      null,
      { params }
    );
    return facebookResult(data.id);
  } catch (error) {
    throw toGraphError(error, 'Facebook');
  }
};

function facebookResult(postId: string): PublishResult {
  return {
    platformPostId: postId,
    url: `https://www.facebook.com/${postId}`,
    success: true,
    message: 'Successfully posted to Facebook',
  };
}

// Helper function to refresh access tokens
// Refreshes a social account's access token using its platform's refresh flow,
// persists the new (encrypted) token + expiry, and returns the new plaintext
// access token. Throws if the platform doesn't support refresh (e.g. Meta, which
// uses long-lived Page tokens) or no refresh token is stored.
export const refreshAccessToken = async (socialAccountId: string): Promise<string> => {
  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId }
  });

  if (!account) {
    throw new Error('Social account not found');
  }

  const provider = getOAuthProvider(account.platform as Platform);
  if (!provider.refresh) {
    throw new Error(`Token refresh is not supported for ${account.platform}`);
  }
  if (!account.refreshToken) {
    throw new Error('No refresh token available for this account');
  }

  const config = getProviderConfig(account.platform as Platform);
  const tokens = await provider.refresh(decrypt(account.refreshToken), config);

  await prisma.socialAccount.update({
    where: { id: socialAccountId },
    data: {
      accessToken: encrypt(tokens.accessToken),
      // Some providers rotate the refresh token; keep the old one if they don't.
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : account.refreshToken,
      tokenExpiry: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null,
    },
  });

  return tokens.accessToken;
};

// Helper function to validate post content for each platform
export const validatePostForPlatform = (post: PublishablePost): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  switch (post.account.platform) {
    case 'TWITTER':
      if (post.content.length > 280) {
        errors.push('Twitter posts cannot exceed 280 characters');
      }
      if (post.images.length > 4) {
        errors.push('Twitter posts cannot have more than 4 images');
      }
      break;

    case 'INSTAGRAM':
      if (post.images.length === 0) {
        errors.push('Instagram posts require at least one image');
      }
      if (post.images.length > 10) {
        errors.push('Instagram posts cannot have more than 10 images');
      }
      if (post.content.length > 2200) {
        errors.push('Instagram captions cannot exceed 2200 characters');
      }
      break;

    case 'LINKEDIN':
      if (post.content.length > 3000) {
        errors.push('LinkedIn posts cannot exceed 3000 characters');
      }
      break;

    case 'FACEBOOK':
      if (post.content.length > 63206) {
        errors.push('Facebook posts cannot exceed 63206 characters');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
};