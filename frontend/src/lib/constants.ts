import type { Platform, PostStatus } from '@/types/post';
import { Twitter, Instagram, Linkedin, Facebook, type LucideIcon } from 'lucide-react';

export const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  TWITTER:   Twitter,
  INSTAGRAM: Instagram,
  LINKEDIN:  Linkedin,
  FACEBOOK:  Facebook,
} as const;

export const PLATFORM_COLORS: Record<Platform, string> = {
  TWITTER:   '#181817',
  INSTAGRAM: '#FF6E00',
  LINKEDIN:  '#FF9B4F',
  FACEBOOK:  '#FFB67D',
} as const;

export const PLATFORM_LABELS: Record<Platform, string> = {
  TWITTER:   'Twitter',
  INSTAGRAM: 'Instagram',
  LINKEDIN:  'LinkedIn',
  FACEBOOK:  'Facebook',
} as const;

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
