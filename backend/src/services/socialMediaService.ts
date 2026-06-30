import prisma from '../lib/db';
import { PublishablePost } from '../types/post';
import { PublishResult } from '../types/publishResult';
import { encrypt, decrypt } from '../lib/crypto';
import { getOAuthProvider, getProviderConfig } from './oauth';
import { Platform } from '../types/enums';
import { publishToTwitter } from './platforms/twitterService';
import { publishToInstagram } from './platforms/instagramService';
import { publishToLinkedIn } from './platforms/linkedinService';
import { publishToFacebook } from './platforms/facebookService';

// Routes a publish request to the right platform service. Each service owns its
// API calls, validation, and error mapping (see services/platforms/).
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

// Validates post content against each platform's limits.
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
