import React from 'react';
import { PLATFORM_ICONS } from '@/lib/constants';
import { Platform } from '@/types/post';

// Renders the lucide brand icon for a platform.
export function PlatformIcon({
  platform,
  className = 'w-4 h-4',
}: {
  platform: Platform;
  className?: string;
}) {
  const normalizedPlatform = platform.toUpperCase() as Platform;
  const Icon = PLATFORM_ICONS[normalizedPlatform] ?? PLATFORM_ICONS.TWITTER;
  return <Icon className={className} />;
}

export default PlatformIcon;
