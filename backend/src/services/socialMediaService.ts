import axios from 'axios';
import prisma from '../lib/db';
import { PublishablePost } from '../types/post';
import { PublishResult } from '../types/publishResult';

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
    throw new Error(formatTwitterError(error));
  }
};

// Turns a Twitter API failure into a meaningful, recordable message.
function formatTwitterError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { detail?: string; title?: string; errors?: { message?: string }[] }
      | undefined;
    const detail = data?.detail || data?.title || data?.errors?.[0]?.message;

    switch (status) {
      case 401:
        return `Twitter authentication failed; the access token is invalid or expired${detail ? `: ${detail}` : ''}`;
      case 403:
        return `Twitter rejected the post${detail ? `: ${detail}` : ' (duplicate content or insufficient permissions)'}`;
      case 429:
        return 'Twitter API rate limit exceeded; try again later';
      default:
        return detail
          ? `Twitter API error: ${detail}`
          : `Twitter API error${status ? ` (HTTP ${status})` : ''}`;
    }
  }
  return error instanceof Error ? error.message : 'Unknown Twitter API error';
}

// Instagram Publishing
const publishToInstagram = async (post: PublishablePost): Promise<PublishResult> => {
  // TODO: Implement Instagram Basic Display API / Instagram Graph API
  
  console.log('Publishing to Instagram:', {
    content: post.content,
    images: post.images,
    //hashtags: post.hashtags,
  });

  // Instagram requires at least one image
  if (!post.images || post.images.length === 0) {
    throw new Error('Instagram posts require at least one image');
  }

  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (Math.random() < 0.85) {
    return {
      platformPostId: `instagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: `https://instagram.com/p/ABC123`,
      success: true,
      message: 'Successfully posted to Instagram'
    };
  } else {
    throw new Error('Instagram API error: Invalid media format');
  }
};

// LinkedIn Publishing
const publishToLinkedIn = async (post: PublishablePost): Promise<PublishResult> => {
  // TODO: Implement LinkedIn API integration
  
  console.log('Publishing to LinkedIn:', {
    content: post.content,
    images: post.images,
  });

  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (Math.random() < 0.92) {
    return {
      platformPostId: `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: `https://linkedin.com/posts/activity-123456789`,
      success: true,
      message: 'Successfully posted to LinkedIn'
    };
  } else {
    throw new Error('LinkedIn API error: Content too long');
  }
};

// Facebook Publishing
const publishToFacebook = async (post: PublishablePost): Promise<PublishResult> => {
  // TODO: Implement Facebook Graph API integration
  
  console.log('Publishing to Facebook:', {
    content: post.content,
    images: post.images,
  });

  await new Promise(resolve => setTimeout(resolve, 1200));
  
  if (Math.random() < 0.88) {
    return {
      platformPostId: `facebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: `https://facebook.com/posts/123456789`,
      success: true,
      message: 'Successfully posted to Facebook'
    };
  } else {
    throw new Error('Facebook API error: Spam detected');
  }
};

// Helper function to refresh access tokens
export const refreshAccessToken = async (socialAccountId: string): Promise<string> => {
  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId }
  });

  if (!account || !account.refreshToken) {
    throw new Error('No refresh token available');
  }

  // TODO: Implement token refresh logic for each platform
  // This is platform-specific and requires OAuth implementation
  
  console.log(`Refreshing token for ${account.platform} account: ${account.username}`);
  
  // For now, return the existing token
  return account.accessToken;
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