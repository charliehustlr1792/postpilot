import type { Platform, PostStatus } from '@/types/post';
import { Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import type { ComponentType } from 'react';
import { RedditIcon } from '@/components/ui/BrandIcons';

export const PLATFORM_ICONS: Record<Platform, ComponentType<{ className?: string }>> = {
  TWITTER:   Twitter,
  INSTAGRAM: Instagram,
  LINKEDIN:  Linkedin,
  FACEBOOK:  Facebook,
  REDDIT:    RedditIcon,
} as const;

export const PLATFORM_COLORS: Record<Platform, string> = {
  TWITTER:   '#181817',
  INSTAGRAM: '#FF6E00',
  LINKEDIN:  '#FF9B4F',
  FACEBOOK:  '#FFB67D',
  REDDIT:    '#FF4500',
} as const;

export const PLATFORM_LABELS: Record<Platform, string> = {
  TWITTER:   'X',
  INSTAGRAM: 'Instagram',
  LINKEDIN:  'LinkedIn',
  FACEBOOK:  'Facebook',
  REDDIT:    'Reddit',
} as const;

export const ALL_PLATFORMS: Platform[] = ['TWITTER', 'LINKEDIN', 'REDDIT', 'INSTAGRAM', 'FACEBOOK'];

/** Platforms that need Meta App Review / business verification before OAuth can ship. */
export const META_PLATFORMS: Platform[] = ['INSTAGRAM', 'FACEBOOK'];

/**
 * Platforms shown in the UI but not open for public connection yet. Meta needs
 * business verification; Reddit's API app creation is gated behind Reddit's
 * approval process, so it stays disabled until a key is granted.
 */
export const COMING_SOON_PLATFORMS: Platform[] = [...META_PLATFORMS, 'REDDIT'];

export function platformUnavailableReason(platform: Platform): string {
  if (COMING_SOON_PLATFORMS.includes(platform)) {
    return 'Coming soon';
  }
  return 'Not configured yet';
}

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-600 border-gray-200',
  SCHEDULED: 'bg-blue-50 text-blue-600 border-blue-200',
  PUBLISHED: 'bg-green-50 text-green-600 border-green-200',
  FAILED:    'bg-red-50 text-red-600 border-red-200',
} as const;

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT:     'Draft',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  FAILED:    'Failed',
} as const;
